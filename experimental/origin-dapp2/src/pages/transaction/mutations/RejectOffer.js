import React, { Component } from 'react'
import { Mutation } from 'react-apollo'

import WithdrawOfferMutation from 'mutations/WithdrawOffer'

import Modal from 'components/Modal'
import TransactionError from 'components/TransactionError'
import WaitForTransaction from 'components/WaitForTransaction'
import withCanTransact from 'hoc/withCanTransact'

class RejectOffer extends Component {
  state = {}
  render() {
    return (
      <Mutation
        mutation={WithdrawOfferMutation}
        onCompleted={({ withdrawOffer }) =>
          this.setState({ waitFor: withdrawOffer.id })
        }
        onError={errorData =>
          this.setState({
            waitFor: false,
            error: 'mutation',
            errorData
          })
        }
      >
        {withdrawOffer => (
          <>
            <button
              className={this.props.className}
              onClick={() => this.setState({ sure: true })}
              children={this.props.children}
            />
            {!this.state.sure ? null : (
              <Modal
                onClose={() =>
                  this.setState({ sure: false, sureShouldClose: false })
                }
                shouldClose={this.state.sureShouldClose}
              >
                <h2>Reject Offer</h2>
                Are you sure you want to reject this offer? The buyers funds
                will be returned to them.
                <div className="actions">
                  <button
                    className="btn btn-outline-light"
                    onClick={() => this.setState({ sureShouldClose: true })}
                    children="Cancel"
                  />
                  <button
                    className="btn btn-outline-light"
                    onClick={() => this.onClick(withdrawOffer)}
                    children="Reject"
                  />
                </div>
              </Modal>
            )}
            {this.renderWaitModal()}
            {this.state.error && (
              <TransactionError
                reason={this.state.error}
                data={this.state.errorData}
                onClose={() => this.setState({ error: false })}
              />
            )}
          </>
        )}
      </Mutation>
    )
  }

  onClick(withdrawOffer) {
    this.setState({ sureShouldClose: true })

    if (this.props.cannotTransact) {
      this.setState({
        error: this.props.cannotTransact,
        errorData: this.props.cannotTransactData
      })
      return
    }

    this.setState({ waitFor: 'pending' })
    withdrawOffer({
      variables: {
        offerID: this.props.offer.id,
        from: this.props.offer.listing.seller.id
      }
    })
  }

  renderWaitModal() {
    if (!this.state.waitFor) return null

    return (
      <WaitForTransaction hash={this.state.waitFor} event="OfferWithdrawn">
        {({ client }) => (
          <div className="make-offer-modal">
            <div className="success-icon" />
            <div>Success!</div>
            <button
              href="#"
              className="btn btn-outline-light"
              onClick={() => {
                client.resetStore()
                this.setState({ waitFor: false })
              }}
              children="OK"
            />
          </div>
        )}
      </WaitForTransaction>
    )
  }
}

export default withCanTransact(RejectOffer)