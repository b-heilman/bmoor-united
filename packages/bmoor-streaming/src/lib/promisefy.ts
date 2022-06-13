export async function promisefy<T>(stream): Promise<T[]> {
	return new Promise((resolve, reject) => {
		const rtn = [];
		stream.on('data', (data) => {
			rtn.push(data);
		});

		stream.on('end', () => resolve(rtn));
		stream.on('error', (err) => reject(err));
	});
}
