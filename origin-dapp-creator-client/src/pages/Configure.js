'use strict'

import React from 'react'

import Redirect from 'components/Redirect'
import listingSchemaMetadata from 'origin-dapp/src/utils/listingSchemaMetadata'

class Configure extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      config: props.config,
      expandedCategories: [],
      filterByTypeEnabled: this.getCategoryFromConfig(),
      listingTypes: listingSchemaMetadata.listingTypes,
      listingSchemasByCategory: listingSchemaMetadata.listingSchemasByCategory,
      redirect: null
    }

    this.getCategoryFromConfig = this.getCategoryFromConfig.bind(this)
    this.getSubcategoryFromConfig = this.getSubcategoryFromConfig.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.isCategoryDropdownDisplayed = this.isCategoryDropdownDisplayed.bind(
      this
    )
    this.isCheckedSubcategory = this.isCheckedSubcategory.bind(this)
    this.isExpandedCategory = this.isExpandedCategory.bind(this)
    this.onCategoryCheck = this.onCategoryCheck.bind(this)
    this.onSubcategoryCheck = this.onSubcategoryCheck.bind(this)
    this.toggleFilterByOwn = this.toggleFilterByOwn.bind(this)
    this.toggleFilterByType = this.toggleFilterByType.bind(this)
    this.toggleCategory = this.toggleCategory.bind(this)
  }

  async handleSubmit() {
    this.setState({ redirect: '/metamask' })
  }

  // Retrieve the category object from the filter value in the config
  getCategoryFromConfig() {
    if (!this.props.config.filters.listings.category) return null
    const translationId = this.props.config.filters.listings.category
    return listingSchemaMetadata.listingTypes.find(listingType => {
      return listingType.translationName.id == translationId
    })
  }

  // Retrieve the subCategory object from filter value in the config
  getSubcategoryFromConfig() {
    if (!this.props.config.filters.listings.subCategory) return false

    const category = this.getCategoryFromConfig()
    if (!category) {
      return false
    }

    const subCategories =
      listingSchemaMetadata.listingSchemasByCategory[category.type]
    const translationId = this.props.config.filters.listings.subCategory

    return subCategories.find(subCategory => {
      return subCategory.translationName.id == translationId
    })
  }

  // Determines if the category dropdown should be displayed
  isCategoryDropdownDisplayed() {
    return this.isCategoryFiltered() || this.state.filterByTypeEnabled
  }

  // Determines if there is either category or subcategory filtering applied in configs filters
  isCategoryFiltered() {
    return (
      this.props.config.filters.listings.category ||
      this.props.config.filters.listings.subCategory
    )
  }

  // Determines if a checkbox for a subcategory should be checked
  isCheckedSubcategory(category, subcategory) {
    return (
      (this.getCategoryFromConfig() === category &&
        !this.getSubcategoryFromConfig()) ||
      this.getSubcategoryFromConfig() === subcategory
    )
  }

  // Determines if a category should be expanded so that all of its subcategories are displayed
  isExpandedCategory(category) {
    return this.state.expandedCategories.includes(category)
  }

  setListingFilters(obj) {
    const newConfig = {
      ...this.state.config,
      filters: {
        ...this.state.config.filters,
        listings: {
          ...this.state.config.filters.listings,
          ...obj
        }
      }
    }

    // Update config for this component
    this.setState({ config: newConfig })
    // Propagate to parent
    this.props.onChange(newConfig)
  }

  // Handles filter updates when a category is checked
  onCategoryCheck(category) {
    if (this.getCategoryFromConfig() === category) {
      this.setListingFilters({
        category: null,
        subCategory: null
      })
    } else {
      this.setListingFilters({
        category: category.translationName.id,
        subCategory: null
      })
    }
  }

  // Handles filter updates when a subcategory is checked
  onSubcategoryCheck(category, subcategory) {
    if (this.getSubcategoryFromConfig() === subcategory) {
      this.setListingFilters({
        category: null,
        subCategory: null
      })
    } else {
      this.setListingFilters({
        category: category.translationName.id,
        subCategory: subcategory.translationName.id
      })
    }
  }

  toggleCategory(event, category) {
    if (event.target.type === 'checkbox') return
    if (this.state.expandedCategories.includes(category)) {
      this.setState(prevState => {
        return {
          expandedCategories: prevState.expandedCategories.filter(
            x => x !== category
          )
        }
      })
    } else {
      this.setState(prevState => {
        return {
          expandedCategories: [...prevState.expandedCategories, category]
        }
      })
    }
  }

  toggleFilterByOwn(event) {
    this.setListingFilters({
      marketplacePublisher: event.target.checked ? web3.eth.accounts[0] : null
    })
  }

  toggleFilterByType(event) {
    this.setState({
      filterByTypeEnabled: event.target.checked
    })
    if (!event.target.checked) {
      // Remove any listing filters for categories if the optional is disabled
      this.setListingFilters({
        category: null,
        subCategory: null
      })
    }
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        {this.renderRedirect()}

        <h1>Configure Your Marketplace</h1>
        <h4>Finish setting up your marketplace with the options below.</h4>

        <div className="form-group">
          <label>Filter Listings (optional)</label>

          <p>
            <small>
              You can choose to only show listings created on your marketplace
              or specific types of listings. Otherwise, your DApp will show
              listings from all Origin marketplaces.
            </small>
          </p>

          <div className="option">
            <input
              className="form-check-input"
              type="checkbox"
              checked={this.state.config.filters.listings.marketplacePublisher}
              onChange={this.toggleFilterByOwn}
            />
            Only use listings from my marketplace
          </div>

          <div
            className={`option category-select ${
              this.state.filterByTypeEnabled ? 'expanded' : 'collapsed'
            }`}
          >
            <input
              className="form-check-input"
              type="checkbox"
              checked={this.isCategoryDropdownDisplayed()}
              onChange={this.toggleFilterByType}
            />
            Only use listings from specific categories
          </div>

          {this.isCategoryDropdownDisplayed() && (
            <div className="category-dropdown">
              {this.state.listingTypes.map((listingType, i) => (
                <div key={i}>
                  <div
                    className={`category ${
                      this.isExpandedCategory(listingType)
                        ? 'expanded'
                        : 'collapsed'
                    }`}
                    onClick={event => this.toggleCategory(event, listingType)}
                  >
                    <input
                      type="checkbox"
                      checked={this.getCategoryFromConfig() === listingType}
                      onChange={() => this.onCategoryCheck(listingType)}
                    />
                    {listingType.translationName.defaultMessage}
                  </div>
                  {this.isExpandedCategory(listingType) &&
                    this.state.listingSchemasByCategory[listingType.type].map(
                      (listingSchema, y) => (
                        <div className="subcategory" key={y}>
                          <input
                            type="checkbox"
                            checked={this.isCheckedSubcategory(
                              listingType,
                              listingSchema
                            )}
                            onChange={() =>
                              this.onSubcategoryCheck(
                                listingType,
                                listingSchema
                              )
                            }
                          />
                          {listingSchema.translationName.defaultMessage}
                        </div>
                      )
                    )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="form-actions clearfix">
          <button
            onClick={() => this.setState({ redirect: '/customize' })}
            className="btn btn-outline-primary btn-lg btn-left"
          >
            Back
          </button>

          <button
            type="submit"
            className="btn btn-primary btn-lg btn-right"
            onClick={this.handleSubmit}
          >
            Done
          </button>
        </div>
      </form>
    )
  }

  renderRedirect() {
    if (this.state.redirect !== null) {
      return <Redirect to={this.state.redirect} />
    }
  }
}

require('react-styl')(`
  .option
    background-color: var(--pale-grey-four)
    border: 1px solid var(--light)
    padding: 0.75rem 2rem 0.75rem 2rem
    border-radius: var(--default-radius)
    margin-bottom: 0.25rem
    position: relative

  .disabled
    color: var(--light)

  .category-dropdown
    padding: 1rem
    border: 1px solid var(--light)
    margin-top: -5px
    border-bottom-left-radius: var(--default-radius)
    border-bottom-right-radius: var(--default-radius)
    background-color: var(--pale-grey-four)

  .category-dropdown ul
    margin-bottom: 0

  .category-select.expanded
    border-bottom-left-radius: 0
    border-bottom-right-radius: 0

  .category
    position: relative
    padding-left: 1.2rem
    cursor: pointer
    margin-bottom: 0.5rem

  .category
    input
      margin-right: 0.5rem

  .category.collapsed:before
    content: ''
    width: 0
    height: 0
    border-top: 5px solid transparent
    border-bottom: 5px solid transparent
    border-left: 5px solid black
    position: absolute
    left: 0
    top: 0.5rem

  .category.expanded:before
    content: ''
    width: 0
    height: 0
    border-left: 5px solid transparent
    border-right: 5px solid transparent
    border-top: 5px solid black
    position: absolute
    left: 0
    top: 0.75rem

  .subcategory
    padding-left: 2rem

  .subcategory
    input
      margin-right: 0.5rem
`)

export default Configure
