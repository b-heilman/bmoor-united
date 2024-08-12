import {
	SqlDeleteRequest,
	SqlInsertRequest,
	SqlPrepared,
	SqlQueryRequest,
	SqlSelectRequest,
	SqlSelectResponse,
	SqlUpdateRequest,
	SqlWhereArrayMethods,
	SqlWhereExpression,
	SqlWhereJoin,
	SqlWhereRequest,
	SqlWhereResponse,
	SqlWhereScalarMethods,
} from './sql.interface';

export function translateExpressable(
	expression: SqlWhereExpression,
): SqlWhereResponse {
	const where = [];
	const params = [];

	if ('ops' in expression) {
		expression.ops.forEach((op) => {
			if ('ops' in op) {
				const sub = translateExpressable(op);

				where.push('(' + sub.where + ')');
				params.push(...sub.params);
			} else {
				const path = op.path;
				const operator = op.operator;

				// has to be a param
				if (Array.isArray(op.value)) {
					const comp = SqlWhereArrayMethods[operator];

					where.push(`\`${op.series}\`.\`${path}\`${comp}(?)`);
					params.push(op.value);
				} else {
					const comp = SqlWhereScalarMethods[operator];

					where.push(`\`${op.series}\`.\`${path}\`${comp}?`);
					params.push(op.value);
				}
			}
		});
	}

	return {
		where: where.join(SqlWhereJoin[expression.join || 'and']),
		params,
	};
}

export function translateWhere(stmt: SqlWhereRequest): SqlWhereResponse {
	let res;

	if (stmt.params) {
		res = translateExpressable(stmt.params);
	} else {
		res = {
			where: null,
			params: [],
		};
	}

	// TODO: what was I doing with filters?
	if (stmt.filters) {
		const t = translateExpressable(stmt.filters);

		if (res.where) {
			res.where += ` AND (${t.where})`;
		} else {
			res.where = t.where;
		}

		res.params.push(...t.params);
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
export function translateSelect(
	stmt: SqlSelectRequest,
): SqlSelectResponse {
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

export function prepareQuery(stmt: SqlQueryRequest): SqlPrepared {
	const select = translateSelect(stmt.select);
	const where = translateWhere(stmt);

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

export function prepareInsert(stmt: SqlInsertRequest): SqlPrepared {
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
		params: [stmt.params],
	};
}

export function prepareUpdate(stmt: SqlUpdateRequest): SqlPrepared {
	const where = translateWhere(stmt.where);

	if (stmt.model.fields.length !== stmt.params.length) {
		throw new Error('named fields and data fields do not match');
	}

	const params = stmt.model.fields.reduce((agg, field, i) => {
		agg[field.path] = stmt.params[i];

		return agg;
	}, {});

	// I assume there will always be a where
	return {
		sql: `
		UPDATE \`${stmt.model.name}\` SET ?
		WHERE ${where.where};
		`,
		params: [params, ...where.params],
	};
}

export function prepareDelete(stmt: SqlDeleteRequest): SqlPrepared {
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
