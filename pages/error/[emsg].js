/*
 * This is an error page
 */

import Link from 'next/link'
import React, {Component} from 'react'
import Layout from '../../layouts/minimalist/border0.js'
import { useRouter } from 'next/router'

const ErrorDisplay = () => {
	const router = useRouter()
	const { emsg } = router.query

	const linkStyle = {
		marginRight: 30,
		marginLeft: 30
	};

	return <div>
		<Layout>
		<h1>{ emsg }</h1>
		</Layout>
		<Link href="/"><a style={linkStyle}>Back to Dashboard</a></Link>

		</div>
}

export default ErrorDisplay
