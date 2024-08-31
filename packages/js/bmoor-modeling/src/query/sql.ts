import {
	RequestCreate,
	RequestDelete,
	RequestRead,
	RequestSelect,
	RequestUpdate,
	RequestWhereArrayMethods,
	RequestWhereExpression,
	RequestWhereJoin,
	RequestWhereScalarMethods,
} from '../request.interface';
import {
	SqlPrepared,
	SqlSelectResponse,
	SqlWhereResponse,
} from './sql.interface';

export function translateExpressable(
	expression: RequestWhereExpression,
): SqlWhereResponse {
	const where = [];
	const params = [];

	if ('conditions' in expression) {
		expression.conditions.forEach((op) => {
			if ('conditions' in op) {
				const sub = translateExpressable(op);

				where.push('(' + sub.where + ')');
				params.push(...sub.params);
			} else {
				const path = op.path;
				const operator = op.operator;

				// has to be a param
				if (Array.isArray(op.value)) {
					const comp = RequestWhereArrayMethods[operator];

					where.push(`\`${op.series}\`.\`${path}\`${comp}(?)`);
					params.push(op.value);
				} else {
					const comp = RequestWhereScalarMethods[operator];

					where.push(`\`${op.series}\`.\`${path}\`${comp}?`);
					params.push(op.value);
				}
			}
		});
	}

	return {
		where: where.join(RequestWhereJoin[expression.join || 'and']),
		params,
	};
}

export function translateWhere(stmt: RequestWhereExpression): SqlWhereResponse {
	let res;

	if (stmt && stmt.conditions.length) {
		res = translateExpressable(stmt);
	} else {
		return {
			where: null,
			params: [],
		};
	}

	if (!res.where) {
		return {
			where: null,
			params: [],
		};
	} else {
		return {
			where: res.where.length ? res.where : null,
			params: res.params,
		};
	}
}

// expect the
export function translateSelect(stmt: RequestSelect): SqlSelectResponse {
	const reduction = stmt.models.reduce(
		(agg, model) => {
			const modelName = model.name;
			const modelRef = model.series || modelName;

			model.fields.forEach((field) => {
				// as => alias
				if (field.as) {
					agg.select.push(
						`\`${modelRef}\`.\`${field.path}\` AS \`${field.as}\``,
					);
				} else {
					agg.select.push(`\`${modelRef}\`.\`${field.path}\``);
				}
			});

			if (model.joins) {
				const joins = Object.values(model.joins);
				if (joins.length) {
					joins.forEach((join) => {
						const type = join.optional ? 'LEFT JOIN' : 'INNER JOIN';
						const joinPoint = `${type} \`${modelName}\` AS \`${modelRef}\``;

						// I support this, but it never happens in the framework
						const on = join.mappings.map((on) => {
							const dis = `\`${modelRef}\`.\`${on.from}\``;
							const dat = `\`${join.toSeries}\`.\`${on.to}\``;

							return `${dis} = ${dat}`;
						});

						agg.from.push(`${joinPoint} ON ${on.join(' AND ')}`);
					});
				} else {
					agg.from.push(`\`${modelName}\` AS \`${modelRef}\``);
				}
			} else {
				// I hate duplicating lines, but I'm tired
				agg.from.push(`\`${modelName}\` AS \`${modelRef}\``);
			}

			return agg;
		},
		{
			select: [],
			from: [],
		},
	);

	const sorts = stmt.sorts;
	const offset = stmt.offset;

	return {
		select: `${reduction.select.join(',\n\t')}`,
		from: `${reduction.from.join('\n\t')}`,
		orderBy:
			sorts && sorts.length
				? sorts
						.map(
							(order) =>
								`\`${order.series}\`.\`${order.path}\` ` +
								(order.ascending ? 'ASC' : 'DESC'),
						)
						.join(',')
				: null,
		limit: offset
			? offset.start
				? `${offset.start}, ${offset.limit}`
				: String(offset.limit)
			: null,
	};
}

export function prepareQuery(stmt: RequestRead): SqlPrepared {
	const select = translateSelect(stmt.select);
	const where = translateWhere(stmt.where);

	let sql = `SELECT ${select.select} \nFROM ${select.from}`;

	if (where.where) {
		sql += `\nWHERE ${where.where}`;
	}

	if (select.orderBy) {
		sql += `\nORDER BY ${select.orderBy}`;
	}

	if (select.limit) {
		sql += `\nLIMIT ${select.limit}`;
	}

	return {
		params: where.params,
		sql,
	};
}

export function prepareInsert(stmt: RequestCreate): SqlPrepared {
	// ` ON DUPLICATE KEY UPDATE ?`;
	/*stmt.getInOrder().forEach((model) => {
		const keyField = model.model.getKeyField();
		
		if (model.payload){
			sql += `
			INSERT INTO ${model.schema} SET ?;
			
			SELECT ${select.select}
			FROM ${model.schema}
			WHERE ${keyField} = last_insert_id();
			`;

			params.push(model.payload);
		}
	});*/

	/**
	SELECT ${select.select}
	FROM ${select.from}
	WHERE ${keyField} = last_insert_id();
	**/
	// INSERT INTO MyTable ( Column1, Column2 ) VALUES
	// ( Value1, Value2 ), ( Value1, Value2 )
	const fields = stmt.model.fields.map((field) => field.path);

	return {
		sql: `
		INSERT INTO ${stmt.model.name} (\`${fields.join('`,`')}\`) SET ?;
		`,
		// TODO: how to handle if one or many arrays
		params: stmt.params.map((row) => fields.map((field) => row[field])),
	};
}

export function prepareUpdate(stmt: RequestUpdate): SqlPrepared {
	const where = translateWhere(stmt.where);

	// I assume there will always be a where
	return {
		sql: `
		UPDATE \`${stmt.model.name}\` SET ?
		WHERE ${where.where};
		`,
		params: [stmt.params[0], ...where.params],
	};
}

export function prepareDelete(stmt: RequestDelete): SqlPrepared {
	const where = translateWhere(stmt.where);

	// I assume there will always be a where
	return {
		sql: `
		DELETE FROM \`${stmt.model.name}\`
		WHERE ${where.where};
		`,
		params: where.params,
	};
}
