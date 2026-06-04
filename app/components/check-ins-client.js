'use client';

import { useEffect, useState } from 'react';
import { CheckInHeader, CheckInRow } from '@/app/components/ui';
import {
	CHECK_INS_UPDATED_EVENT,
	fetchCheckIns,
} from '@/app/lib/check-ins';

export function CheckInOverview() {
	const [checkIns, setCheckIns] = useState([]);
	const [errorMessage, setErrorMessage] = useState('');

	useEffect(() => {
		let cancelled = false;

		async function loadCheckIns() {
			try {
				const nextCheckIns = await fetchCheckIns();

				if (!cancelled) {
					setCheckIns(nextCheckIns);
					setErrorMessage('');
				}
			} catch (error) {
				if (!cancelled) {
					setErrorMessage(error.message);
				}
			}
		}

		loadCheckIns();

		function handleCheckInsUpdated() {
			loadCheckIns();
		}

		window.addEventListener(CHECK_INS_UPDATED_EVENT, handleCheckInsUpdated);

		return () => {
			cancelled = true;
			window.removeEventListener(
				CHECK_INS_UPDATED_EVENT,
				handleCheckInsUpdated,
			);
		};
	}, []);

	return (
		<>
			<CheckInHeader checkIns={checkIns} />
			<CheckInRow checkIns={checkIns} />
			{errorMessage ? <p className="checkin-error">{errorMessage}</p> : null}
		</>
	);
}
