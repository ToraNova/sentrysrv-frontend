//A component to handle viewing alerts

import React, {Component} from 'react'
import { Container, Row, Col, Button } from 'react-bootstrap';

class AlertDetail extends Component {

	constructor(props){
		super(props)
	}

	componentDidMount(){
	}

	timedisp(isostr) {
		const d = new Date(isostr)
		return d.toString()
	}

	render(){
		const butlist = [
			{variant: "danger", reason: "Intruder" },
			{variant: "warning", reason: "False Alarm" },
			{variant: "primary", reason: "Animal" },
			{variant: "primary", reason: "Worker" },
			{variant: "secondary", reason: "Accident" },
			{variant: "success", reason: "Testing" }
		]
		return(
		<div>
		<Container>
		<Row>
		<p>Alert Time : {this.props.value ?
				this.timedisp(this.props.value.created_at)
				: 'N/A'}
		</p>
		</Row>
		<Row>
		<p>Alert Details : {this.props.value ?
				JSON.stringify(this.props.value.Details)
				: 'N/A'}
		</p>
		</Row>
		<Row>
			{
			this.props.value ?
			butlist.map( (but) => (
			<Col key={but.reason}><Button block={true} variant={but.variant}
				type="submit" value={but.reason} onClick={this.props.onSubmit}>{but.reason}</Button></Col>
			))
			:
			butlist.map( (but) => (
			<Col key={but.reason}><Button block={true} variant={but.variant}
				type="submit" value={but.reason} onClick={this.props.onSubmit} disabled>{but.reason}</Button></Col>
			))
			}
		</Row>
		</Container>

		<style jsx>{`
		`}</style>
		</div>
		)
	}
}

AlertDetail.defaultProps = {
}

export default AlertDetail
