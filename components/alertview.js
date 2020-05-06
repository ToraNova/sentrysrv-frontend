//A component to handle viewing alerts

import React, {Component} from 'react'

class AlertView extends Component {

	constructor(props){
		super(props)
	}

	componentDidMount(){
	}

	dispImg(){
		if(this.props.value == undefined){
			return []
		}else{
			return this.props.value.Attachment
		}

	}

	dispE(){
		if (this.props.value == undefined){
		}else{
			if(this.props.value.Attachment.length <= 0){
				return 'No images captured.'
			}
		}
		return ''
	}

	render(){
		return(
		<div>
			<p>{this.dispE()}</p>
			<div id='imgpane'>
			{
			this.dispImg().map((attach) => (
			<img className='aimage' key={attach.hash} name={attach.name} alt={attach.created_at} src={process.env.backend_urlp+attach.url}/>
			))
			}
			</div>
			<div id='infopane'>
			<table>
			<thead>
				<tr>
				<td>Selected alert #{this.props.value ? this.props.value.id : 'No alert selected'}</td>
				<td></td>
				</tr>
			</thead>
			<tbody>
				<tr>
				<td>Host Name</td>
				<td>{this.props.value ? this.props.value.fence_host.HostName : 'N/A'}</td>
				</tr>
				<tr>
				<td>Segment Name</td>
				<td>{this.props.value ? this.props.value.fence_segment.SegmentName : 'N/A'}</td>
				</tr>
				<tr>
				<td>Branch Number</td>
				<td>{this.props.value ? this.props.value.OriginBranch : 'N/A'}</td>
				</tr>
			</tbody>
			</table>
			</div>
		<style jsx>{`
		.aimage {
			max-width:100%;
			max-height:100%;
			margin-top: 15px;
		}
		table {
			text-align: left;
			margin-top: 10px;
			margin-bottom: 10px;
			margin-left: auto;
			margin-right: auto;
		}
		table, th, td {

			border: 1px solid black;
			border-collapse: collapse;
		}
		th, td {
			padding-right: 15px;
			padding-left: 15px;
		}
		`}</style>
		</div>
		)
	}
}

AlertView.defaultProps = {
}

export default AlertView
