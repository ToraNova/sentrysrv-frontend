/*
 * Border layout (contains component in a border)
 * centering
 */

// hyphens can be bypassed
// using java conventions
// text-align -> textAlign
const layoutStyle = {
	margin: 20,
	padding: 20,
	textAlign: 'center',
	border: '2px solid #AAA'
};

const Layout = props => (
	<div style={layoutStyle}>
	{props.children}
	</div>
);

export default Layout;
