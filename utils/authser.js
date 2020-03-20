/*
 * This is a helper utility that allows
 * authentication for pages
 * This is reusable across pages
 * The JWT token is stored as cookies
 */

//redundant but this allows me to explicitly know fetch is from this package
import fetch from 'isomorphic-unfetch'
import AbortController from 'abort-controller'

import Router from 'next/router'

//This class can be used as a service handler for login pages
//or any form of authentication
export default class AuthService {
	//if domain is passed, then use that else fallback to localhost:5000
	constructor(domain) {
		this.domain = domain || 'http://localhost:1996'
		this.fetch = this.fetch.bind(this)
		this.login = this.login.bind(this)
		this.getProfile = this.getProfile.bind(this)
	}

	//signup a user
	signUp(email, name, password){
		return this.fetch(`${this.domain}/user/add`, {
			method: 'POST',
			body: JSON.stringify({
			email,
			name,
			password
		})
		}).then(res => {
			this.setToken(res.token) //arms the token
			return this.fetch(`${this.domain}/user/profile`, {
			method: 'GET'
		})
		}).then(res => {
			this.setProfile(res)
			return Promise.resolve(res)
		}).catch( function(error){
			throw error;
		})
	}

	// Get a token
	login(email, password) {
		return this.fetch(`${this.domain}/user/login`, {
			method: 'POST',
			body: JSON.stringify({
			email,
			password
			})
		}).then(res => {
			this.setToken(res.token) //arms the token
			return this.fetch(`${this.domain}/user/profile`, {
			method: 'GET'
		})
		}).then(res => {
			this.setProfile(res)
			return Promise.resolve(res)
		}).catch( function(error){
			throw error;
		})
	}

	// Checks if there is a saved token and it's still valid
	loggedIn(){
		//TODO : check validity of token ?
		const token = this.getToken()
		//return !!token && !isTokenExpired(token) // handwaiving here
		return !!token
	}

	setProfile(profile){
		// Saves profile data to localStorage
		localStorage.setItem('profile', JSON.stringify(profile))
	}

	getProfile(){
		// Retrieves the profile data from localStorage
		const profile = localStorage.getItem('profile')
		return profile ? JSON.parse(localStorage.profile) : {}
	}

	// Saves user token to localStorage
	setToken(idToken){
		localStorage.setItem('token', idToken)
	}

	// Retrieves the user token from localStorage
	getToken(){
		return localStorage.getItem('token')
	}

	// Clear user token and profile data from localStorage
	// and logout user (from all device /all)
	logout(){
		//only proceed if the user IS logged in
		return this.fetch(`${this.domain}/user/logout/all`, {
			method: 'POST'
		}).then(res => {
			//response is 204
			localStorage.removeItem('token');
			localStorage.removeItem('profile');
			return Promise.resolve(res)
		}).catch( function(error){
			throw error;
		})
	}

	// raises an error in case response status is not a success
	_checkStatus(response) {
		if (response.status >= 200 && response.status < 300) {
			return response
		} else {
			var error = new Error(response.statusText)
			error.response = response
			throw error
		}
	}

	// PLEASE NOTE THAT WE ONLY ACCEPT JSON RESPONSE, PLEASE FORMAT
	// THE RESPONSE FROM BACK-END TO BE JSON LIKE
	// request that are not 200 cannot be read (body thrown away)
	// performs api calls sending the required authentication headers
	// this is actually a wrapper around the 'fetch' function from
	// isomorphic fetch
	fetch(url, options){
		const controller = new AbortController()
		const signal = controller.signal
		setTimeout(() => {
			controller.abort()
		}, 5000)

		const headers = {
			'Accept': 'application/json',
			'Content-Type': 'application/json'
		}

		if (this.loggedIn()){
			headers['Authorization'] = 'Bearer ' + this.getToken()
		}

		return fetch(url, {
			headers:headers,
			signal:signal,
			...options
		})
		.then(this._checkStatus)
		.then(response => response.json())
		.catch(function(error) {
			throw error;
		})
	}
}
