/*
 * This is the index page
 * it corresponds to the / root path
 */

//Link API from Next.js
import Link from 'next/link';

//custom components import
import Nav from './nav.js';
import Border from '../layouts/minimalist/border0.js';

const testcontent = <p>Hello Next.js</p>

//reminder: all elements must be enclosed by a main <div></div> block
const Index = () => (
<div>
<Border>
<Nav />
</Border>
	<div id="main">
	<h1>Fencing Alarms Dashboard System v2.</h1>
	<p>by Advance Communication Sdn Bhd.</p>
	</div>
<style jsx>{`
#main {
	margin:15px;
	padding: 15px;
}
`}</style>
</div>
);

export default Index;
