/*
 * Border layout (contains component in a border)
 * centering
 */

// hyphens can be bypassed
// using java conventions
// text-align -> textAlign
const layoutStyle = {
	border: '2px solid #CCC',
	marginTop: 20,
	padding: 3,
	marginLeft: 5,
	marginRight: 5
};

const Layout = props => (
	<div style={layoutStyle}>
	{props.children}
	</div>
);

export default Layout;
