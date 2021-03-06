/*
 * This is the about page
 * this corresponds to the /about path
 * to write details and information about the webapp
 */

//Link API from Next.js
import Link from 'next/link'
import Head from 'next/head'
import React, {Component, useState} from 'react'
import Router from 'next/router' //router
import Lightbox from "react-image-lightbox";

// import from online
import Select from 'react-select'
import { Container, Row, Col } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import DatePicker from "react-datepicker";
import InputNumber from 'rc-input-number';
import MaterialTable from "material-table";

//custom components import
import Nav from './nav.js'
import Border from '../layouts/minimalist/border2.js'
//requires authentication
import AuthRequired from  '../utils/authreq.js'
import Icon from '@material-ui/core/Icon';

import Search from "@material-ui/icons/Search"
import ViewColumn from "@material-ui/icons/ViewColumn"
import SaveAlt from "@material-ui/icons/SaveAlt"
import ChevronLeft from "@material-ui/icons/ChevronLeft"
import ChevronRight from "@material-ui/icons/ChevronRight"
import FirstPage from "@material-ui/icons/FirstPage"
import LastPage from "@material-ui/icons/LastPage"
import Check from "@material-ui/icons/Check"
import FilterList from "@material-ui/icons/FilterList"
import Remove from "@material-ui/icons/Remove"
import Clear from "@material-ui/icons/Clear"
import ArrowDropDown from "@material-ui/icons/ArrowDropDown"

class AlertView extends Component {

	handleError = (e) => {
		console.log(e);
		console.log(e.stack);
		//window.location.reload(false);//TODO experimental
		Router.push('/error/[emsg]',`/error/${e}`)
	};

	constructor(props){
		super(props)
		var now = new Date();
		var ytd = new Date();
		ytd.setDate(ytd.getDate() - 1);
		const defo = {value: 0, label: 'Any'}
		this.state = {
			imview: false,
			imurl: null,
			enableq: false,
			hostdat: [],
			alist: [],
			hostlist: [],
			seglist: [],
			typelist: [],
			fhostid: defo,
			fsegid: defo,
			fbranch: {value:-1, label: 'Any Branch'},
			ftypeid: defo,
			fsdate: ytd,
			fedate: now,
			flimit: 50000,
			freason: {value:"Any", label:"Any Reason"},
			displayText: '',
		}
	}

	buildTable = (table, a) => {
		var hname = "n/a";
		if(a.fence_segment !== null){
			this.state.hostdat.forEach( (h,i) => {
				if(h.id == a.fence_segment.fence_host)
					hname = h.HostName
			});
		}
		const e = {
			id: a.id,
			rea: a.Reason,
			ori: a.OriginBranch,
			agp: a.fence_segment === null ? 'n/a':a.fence_segment.SegmentInfo,
			seg: a.fence_segment === null ? 'n/a':a.fence_segment.SegmentName,
			box: hname,
			ctime: new Date(a.created_at).toLocaleString(),
			utime: new Date(a.updated_at).toLocaleString(),
			url : a.Attachment.length > 0 ? a.Attachment[0].url : null
		}
		table.push(e);
	};

	uniqueid = (arr) => {
		var u = {}, a = [];
		for(var i = 0; i < arr.length; i++){
			if(!u.hasOwnProperty(arr[i].id)) {
				a.push(arr[i]);
				u[arr[i].id] = 1;
			}
		}
		return a;
	}

	unique = (arr) => {
		var u = {}, a = [];
		for(var i = 0, l = arr.length; i < arr.length; ++i){
			if(!u.hasOwnProperty(arr[i])) {
				a.push(arr[i]);
				u[arr[i]] = 1;
			}
		}
		return a;
	}

	//Main render function
	render(){

		const tableHeader = [
			{ title: "Alert ID", field: "id"},
			{ title: "Reason", field: "rea"},
			{ title: "Box", field: "box"},
			{ title: "Segment", field: "seg"},
			{ title: "Alert Group", field: "agp"},
			{ title: "Origin Branch", field: "ori"},
			{ title: "Alert Time", field: "ctime"},
			{ title: "Update Time", field: "utime"},
		]

		const reasonopt = [
			{value: "Any", label:"Any Reason"},
			{value: "Intruder", label:"Intruder"},
			{value: "False Alarm", label:"False Alarm"},
			{value: "Animal", label:"Animal"},
			{value: "Accident", label:"Accident"},
			{value: "Testing", label:"Testing"},
			{value: "Worker", label:"Worker"},
		]

		const bselopt = [
			{value: -1, label:'Any Branch'},
			{value: 0, label:0},
			{value: 1, label:1},
			{value: 2, label:2},
			{value: 3, label:3},
			{value: 4, label:4}
		]

		const hlink = {
			marginTop: 'auto',
			textAlign: 'right',
			color: 'blue'
		}

		const ctStyle = {
			border: '2px solid #CCC',
			marginTop: '20px',
			padding: '5px',
			marginLeft: '10px',
			marginRight: '10px'
		}

		return (
<div>
<Head>
<title>Alert Supervision</title>
</Head>
<Container fluid>
<Row style={ctStyle}>
	<Col md={3}><h4>Triggered Alert Supervise</h4></Col>
	<Col></Col>
	<Col md={1}>
	<Link href="/"><a style={hlink} >Back to Home</a></Link>
	</Col>
</Row>
<MaterialTable
	title="Triggered Alerts"
	data={this.state.alist}
	columns={tableHeader}
	options={{ search: true, paging: true, exportButton: true, exportCsv: this.csvOut }}
	icons={{
		SortArrow: () => <ArrowDropDown />,
		ResetSearch: () => <Clear />,
		Check: () => <Check />,
		Export: () => <SaveAlt />,
		Filter: () => <FilterList />,
		FirstPage: () => <FirstPage />,
		LastPage: () => <LastPage />,
		NextPage: () => <ChevronRight />,
		PreviousPage: () => <ChevronLeft />,
		Search: () => <Search />,
		ThirdStateCheck: () => <Remove />,
		ViewColumn: () => <ViewColumn />,
		DetailPanel: () => <ChevronRight />
	}}
	onRowClick={this.handleTableClick}
/>
<Row style={ctStyle}><Col>
<p style={{color:'blue'}}>Query Form</p>
<Row>
<Col md={3}>
<div><label>Start Time</label></div>
<div><DatePicker selected={this.state.fsdate} showTimeSelect
onChange={this.changeSDate}/></div>
</Col>
<Col md={3}>
<div><label>End Time</label></div>
<div><DatePicker selected={this.state.fedate} showTimeSelect
onChange={this.changeEDate}/></div>
</Col>
<Col md={3}>
<div><label>By Reason</label></div>
<Select value={this.state.freason}
	onChange={this.changeReason}
	options={reasonopt}/>
</Col>
<Col md={3}>
<div><label>Search Limit (default 1000)</label></div>
<InputNumber style={{height: 40, fontSize: 'large'}} defaultValue={this.state.flimit} onChange={this.changeLimit}/>
</Col>
</Row>
<hr></hr>
<Row>
	<Col md={3}>
	<label>from Box</label>
	<Select value={this.state.fhostid}
		onChange={this.changeHost}
		options={this.state.hostlist}/>
	</Col>
	<Col md={3}>
	<label>from Alert Group</label>
	<Select value={this.state.fsegid}
		onChange={this.changeSegment}
		options={this.state.seglist}/>
	</Col>
	<Col md={3}>
	<label>from Sensor Type</label>
	<Select value={this.state.ftypeid}
		onChange={this.changeType}
		options={this.state.typelist}/>
	</Col>
	<Col md={3}>
	<label>from Branch</label>
	<Select value={this.state.fbranch}
		onChange={this.changeBranch}
		options={bselopt}/>
	</Col>
</Row>
<hr></hr>
<Row>
	<Col>
		{this.state.enableq ?
		<Button block={true} variant="outline-primary"
		type="submit" onClick={this.submitQ}>Query</Button>
		:
		<Button block={true} variant="outline-primary" disabled
		type="submit" onClick={this.submitQ}>Query</Button>
		}
	</Col>
</Row>
<hr></hr>
</Col></Row>
{this.state.imview && (
          <Lightbox
            mainSrc={this.state.imurl}
            onCloseRequest={() => this.setState({ imview: false })}
          />
)}

</Container>
<style jsx>{`
.containers {
    font-size: 28px;
    color: #fff;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: #283c34;
    text-align: center;
}
`}</style>
</div>
		)
	}

	handleTableClick = (evnt, row) => {
		if(row.url !== null){
			this.setState({imurl:process.env.backend_urlp+row.url, imview: true });
		}else{
			alert('no image captured for this alert.');
		}
	}

	csvOut = (cols, dat) =>{
		let csvContent = "data:text/csv;charset=utf-8,";

		let sdate = this.state.fsdate.toLocaleDateString();
		let edate = this.state.fedate.toLocaleDateString();

		let rarr = []
		let karr = []
		for(var col of cols){
			rarr.push(col.title);
			karr.push(col.field);
		}
		let rowstr = rarr.join(',');
		csvContent += rowstr + "\r\n";
		dat.forEach( (e, i) => {
			rarr = []
			for(var field of karr){
				if(e[field] == undefined || e[field] == null)
					rarr.push("N/A");
				else
					rarr.push(e[field]);
			}
			rowstr = rarr.join(',');
			csvContent += rowstr + "\r\n";
		});

		var encodedUri = encodeURI(csvContent);
		var link = document.createElement("a");
		link.setAttribute("href", encodedUri);
		link.setAttribute("href", encodedUri);
		link.setAttribute("download", `${sdate}-${edate}-alerts.csv`);
		document.body.appendChild(link); // firefox
		link.click();
		document.body.removeChild(link); // cleanup
	}

	submitQ = async () => {
		await this.setState({enableq:false});
		//var qurl = `/alerts?_start=0`
		var qurl = `/alerts?created_at_gt=${this.state.fsdate.toISOString()}&created_at_lt=${this.state.fedate.toISOString()}`

		if(this.state.freason.value !== 'Any'){
			//works
			qurl += `&Reason=${this.state.freason.value}`;
		}

		if(this.state.fsegid.value > 0){
			//works
			qurl += `&fence_segment=${this.state.fsegid.value}`;
		}

		if(this.state.ftypeid.value > 0){
			//works
			qurl += `&alert_model=${this.state.ftypeid.value}`;
		}

		if(this.state.fbranch.value > -1){
			//works
			qurl += `&OriginBranch=${this.state.fbranch.value}`;
		}

		const blurl = qurl;
		const maxqlim = 997;
		var fl = this.state.flimit; //left
		var sk = 0; //skip
		var qlist = [];

		if(fl <= 0)
			fl = maxlim;

		while(fl > 0){
			//works
			qlist.push(blurl + `&_limit=${fl > maxqlim ? maxqlim : fl }&_start=${sk}`) //997
			if(fl <= maxqlim){
				break;
			}
			fl -= maxqlim; //998-997 = 1
			sk += maxqlim; //sk 997
		}

		await this.setState({alist:[]}); //clear current table
		var res;
		var q;
		var tmp;
		var pat;
		var stop;
		for(var index=0;index<qlist.length;index++){
			q = qlist[index];
			tmp = [];
			pat = 3;
			stop = false;
			while(pat>0){
				try{
					res = await this.props.auth.dfetch(q, {method:'GET'});
					if(this.state.fhostid.value > 0){
						res.forEach( (e, i) => {
							if(e.fence_segment.fence_host === this.state.fhostid.value)
								this.buildTable(tmp,e);
						});
					}else{
						res.forEach( (e, i) => {
							this.buildTable(tmp,e);
						});
					}
					if(tmp.length == 0){
						stop = true;
						break;
					}
					console.log(`query #${index} recv`,res.length);
					tmp = this.state.alist.concat(tmp);
					this.setState({displayText: tmp < 1 ? 'no result': '',alist: tmp}); //update state
					break;
				}catch(err){
					console.log(index,err);
					pat--;
				}
			}

			if(pat===0){
				alert(`network error fetching request #${index}. please try again`);
				break;
			}else if(stop){
				break;
			}
		}
		alert(`total results: ${this.state.alist.length}`);
		this.setState({enableq:true});
	}

	componentDidMount(){
		this.props.auth.dfetch('/fence-hosts',{method:'GET'})
		.then( res => {
			var tmp = [{value: 0, label: 'Any Host'}]
			res.forEach( (elem, idx) => {
				if(elem.HostName !== null)
					tmp.push({value: elem.id, label:elem.HostName})
			})
			this.setState({
				hostlist: tmp,
				hostdat: res,
				fhostid: 0
			})
		}).catch( (e) => this.handleError(e));

		this.props.auth.dfetch('/fence-segments',{method:'GET'})
		.then( res => {
			var tmp = [{value: 0, label: 'Any Group'}]
			res.forEach( (elem, idx) => {
				if(elem.SegmentInfo !== null)
					tmp.push({value: elem.id, label:elem.SegmentInfo})
			})
			this.setState({
				seglist: tmp,
				fsegid: 0,
				enableq: true
			})
		}).catch( (e) => this.handleError(e));

		this.props.auth.dfetch('/alert-models',{method:'GET'})
		.then( res => {
			var tmp = [{value: 0, label: 'Any Type'}]
			res.forEach( (elem, idx) => {
				if(elem.Element !== null)
					tmp.push({value: elem.id, label:elem.Element})
			})
			this.setState({
				typelist: tmp,
				ftypeid: 0
			})
		}).catch( (e) => this.handleError(e));
	}

	componentWillUnmount() {
	}

	changeLimit = (val) => {
		this.setState({ flimit: val });
	}

	changeSDate = (date) => {
		this.setState({ fsdate: date });
	}

	changeEDate = (date) => {
		this.setState({ fedate: date });
	}

	changeReason = (sel) => {
		this.setState({ freason: sel });
	}

	changeHost = (sel) => {
		this.setState({ fhostid: sel });
	}

	changeSegment = (sel) => {
		this.setState({ fsegid: sel });
	}

	changeBranch = (sel) => {
		this.setState({ fbranch: sel });
	}

	changeType = (sel) => {
		this.setState({ ftypeid: sel });
	}

}

AlertView.defaultProps = {
}

export default AuthRequired(AlertView)
