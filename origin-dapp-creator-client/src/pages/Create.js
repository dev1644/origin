'use strict'

import { getAvailableLanguages } from 'origin-dapp/src/utils/translationUtils.js'
import React from 'react'
import pick from 'lodash/pick'
import superagent from 'superagent'
import debounce from 'lodash/debounce'

import { formInput, formFeedback } from 'utils/formHelpers'
import Redirect from 'components/Redirect'

class Create extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      ...props.config,
      fields: Object.keys(props.config),
      subdomainValidationRequest: null
    }

    this.availableLanguages = getAvailableLanguages().map(language => {
      return {
        value: language.selectedLanguageCode,
        label: language.selectedLanguageFull
      }
    })
    // Add English to the list of available languages
    this.availableLanguages.unshift({ value: 'en-US', label: 'English' })

    this.availableLanguageOptions = this.availableLanguages.map(x => {
      return (
        <option key={x.value} value={x.value}>
          {x.label}
        </option>
      )
    })

    this.handleSubdomainChange = this.handleSubdomainChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  handleSubmit(event) {
    event.preventDefault()

    const newState = {}

    if (!this.state.title) {
      newState.titleError = 'Title is required'
    } else if (this.state.title.length < 3) {
      newState.titleError = 'Title is too short'
    }

    if (!this.state.subdomain) {
      newState.subdomainError = 'Subdomain is required'
    } else if (this.state.subdomain.length < 2) {
      newState.subdomainError = 'Subdomain is too short'
    }

    newState.valid = Object.keys(newState).every(f => f.indexOf('Error') < 0)

    if (!newState.valid) {
      window.scrollTo(0, 0)
    } else if (this.props.onChange) {
      this.props.onChange(pick(this.state, this.state.fields))
    }

    this.setState(newState)

    return newState.valid
  }

  handleSubdomainChange() {
    if (this.state.subdomainValidationRequest) {
      this.state.subdomainValidationRequest.cancel()
    }

    const func = debounce(() => {
      return superagent
        .post(`${process.env.DAPP_CREATOR_API_URL}/validate/subdomain`)
        .send({
          config: {
            subdomain: this.state.subdomain
          },
          address: web3.eth.accounts[0]
        })
        .catch(error => {
          if (error.status === 400) {
            this.setState({
              subdomainError: error.response.text
            })
          } else {
            // TODO
          }
        })
    }, 500)

    this.setState({
      subdomainValidationRequest: func
    })

    func()
  }

  render() {
    const input = formInput(this.state, state => this.setState(state))
    const subdomainInput = formInput(this.state, state => {
      this.setState(state)
      this.handleSubdomainChange()
    })
    const Feedback = formFeedback(this.state)

    if (this.state.valid) {
      return <Redirect to={`/customize`} push />
    }

    return (
      <>
        <h1>Welcome to the Origin Marketplace Creator!</h1>
        <h4>Please provide the information below to get started.</h4>

        <form onSubmit={this.handleSubmit}>
          <div className="form-group">
            <label>Marketplace Title</label>
            <input {...input('title')} />
            {Feedback('title')}
          </div>

          <div className="form-group">
            <label>Subdomain</label>
            <div className="input-group">
              <input {...subdomainInput('subdomain')} />
              <div className="input-group-append">
                <span className="input-group-text">
                  .{process.env.DAPP_CREATOR_DOMAIN}
                </span>
              </div>
              {Feedback('subdomain')}
            </div>
            {/*
            <div className="helper-text">
              You can use your own custom domain name. <a href="#">Here's how</a>
            </div>
            */}
          </div>

          <div className="form-group">
            <label>About</label>
            <textarea {...input('about')} />
            <div className="helper-text">
              A description that will be displayed in the footer of your DApp
            </div>
            {Feedback('description')}
          </div>

          <div className="form-group">
            <label>Language</label>
            <select {...input('languageCode')}>
              {this.availableLanguageOptions}
            </select>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary btn-lg">
              Continue
            </button>
          </div>
        </form>
      </>
    )
  }
}

export default Create
