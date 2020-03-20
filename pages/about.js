/*
 * This is the about page
 * this corresponds to the /about path
 * to write details and information about the webapp
 */

//Link API from Next.js
import Link from 'next/link';

//custom components import
import Nav from './nav.js';
import Border from '../layouts/minimalist/border0.js';

const About = () => (
	<div>
	<Border>
	<Nav />
	</Border>

	<p>Minextjs is a minimal ReactJS front-end application based on NextJS.</p>
	<p>Created by ToraNova</p>

	</div>
);

export default About;
