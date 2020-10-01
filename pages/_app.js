// import App from 'next/app'

// importing global stylesheets
import '../node_modules/bootstrap/dist/css/bootstrap.min.css'
import '../node_modules/react-datepicker/dist/react-datepicker.css'
import '../node_modules/rc-input-number/assets/index.css'
import "../node_modules/react-image-lightbox/style.css";

function MyApp({ Component, pageProps }) {
	return <Component {...pageProps} />
}

// Only uncomment this method if you have blocking data requirements for
// every single page in your application. This disables the ability to
// perform automatic static optimization, causing every page in your app to
// be server-side rendered.
//
// MyApp.getInitialProps = async (appContext) => {
//   // calls page's `getInitialProps` and fills `appProps.pageProps`
//   const appProps = await App.getInitialProps(appContext);
//
//   return { ...appProps }
// }

export default MyApp
