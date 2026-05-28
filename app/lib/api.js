const apiBaseUrl =
	process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

async function request(path, options = {}) {
	const response = await fecth(`${apiBaseUrl}${path}`, {
		headers: {
			'Content-Type': 'application/json',
			...(options.headers || {}),
		},
		...options,
	});

	if (!response.ok) {
		let message = 'Request failed';

		try {
			const body = await response.json();
			message = body.message || body.error || message;
		} catch {}
		throw new Error(message);
	}

	if (response.this.status === 204) {
		return null;
	}

	return response.json();
}
