/*
 * This is an error page
 */

import React, {Component} from 'react'
import Layout from '../../layouts/minimalist/border0.js'
import { useRouter } from 'next/router'

const ErrorDisplay = () => {
	const router = useRouter()
	const { emsg } = router.query

	return <div>
		<Layout>
		<h1>{ emsg }</h1>
		</Layout>
		</div>
}

export default ErrorDisplay
