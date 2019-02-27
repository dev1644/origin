import React, { Component } from 'react'
import dayjs from 'dayjs'

const resetDrag = {
  dragEnd: null,
  dragStart: null,
  dragging: false
}

class Calendar extends Component {
  constructor(props) {
    super(props)
    this.state = {
      //year: dayjs().year(),
      //month: dayjs().month()
      weekStartDate: dayjs().startOf('week')
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.range && !this.props.range) {
      this.setState({ ...resetDrag })
    }
  }

  render() {
    const { weekStartDate } = this.state,
      // startOfMonth = new Date(year, month),
      // date = dayjs(startOfMonth),
      isBeginning = weekStartDate.isBefore(dayjs()), // Is it before now?
      lastDay = weekStartDate.add(1, 'week'),
      hours = []
      // dayAvailability = this.props.availability.getAvailability(
      //   weekStartDate.format('YYYY/MM/DD'),
      //   weekStartDate.endOf('month').format('YYYY/MM/DD')
      // )

    let currentHour = 0
    for (let i = 0; i < 7; i++) { // Days
      for (let j = 0; j < 24; j++) { // Hours
        // hours.push(null)
        hours.push({
          hour: weekStartDate.add(i*24+j, 'hour'),
          price: i*24+j,
          unavailable: false,
          customPrice: null,
          booked: false
        })
      }
    }

    return (
      <div className={`weekCalendar${this.props.small ? ' calendar-sm' : ''}`}>
        <div className="week-chooser">

          <button
            type="button"
            className={`btn btn-outline-secondary prev${
              isBeginning ? ' disabled' : ''
            }`}
            onClick={() => {
              if (isBeginning) {
                return
              }
              this.setState({ weekStartDate: weekStartDate.add(-1, 'week'), ...resetDrag })
              // if (month === 0) {
              //   this.setState({ month: 11, year: year - 1, ...resetDrag })
              // } else {
              //   this.setState({ month: month - 1, ...resetDrag })
              // }
            }}
          />
          {weekStartDate.format('MMM ')}
          {lastDay.month() != weekStartDate.month() ? lastDay.format('- MMM ') : ''}
          {weekStartDate.format('YYYY')}
        {/* TODO: indicate if it crosses into other month. e.g. "March-April 2019" */}
          <button
            type="button"
            className="btn btn-outline-secondary next"
            onClick={() => {
              this.setState({ weekStartDate: weekStartDate.add(+1, 'week'), ...resetDrag })

              // if (month === 11) {
              //   this.setState({ month: 0, year: year + 1, ...resetDrag })
              // } else {
              //   this.setState({ month: this.state.month + 1, ...resetDrag })
              // }
            }}
          />

        </div>

        <div className="day-header">
          {[...Array(7)].map((_, k) => (
            <div key={k}>
              <div className="day-column-name">{weekStartDate.add(k, 'day').format('ddd')}</div>
              <div className="day-column-number">{weekStartDate.add(k, 'day').format('D')}</div>
            </div>
          ))}
        </div>

        <div className={`days${this.state.dragging ? '' : ' inactive'}`}>
          {Array(7*24)
            .fill(0)
            .map((v, idx) => this.renderHour(hours, idx))}
        </div>
      </div>
    )
  }

  renderHour(hours, idx) {
    const hour = hours[idx]
    if (!hour) {
      return (
        <div
          key={idx}
          className={`empty ${idx < 7 ? 'first-row' : 'last-row'}`}
        />
      )
    }

    const date = dayjs(hour.hour)

// Hour in past

    // if (date.add(1, 'day').isBefore(dayjs())) {
    //   return (
    //     <div
    //       key={idx}
    //       className={`day in-past${idx % 7 === 6 ? ' end-row' : ''}`}
    //     >
    //       <div>{date.date()}</div>
    //     </div>
    //   )
    // }

    let content = `${hour.price} ETH`
    if (hour.booked && this.props.showBooked) {
      content = 'Booked'
    } else if (hour.unavailable) {
      content = 'Unavailable'
    } else if (hour.customPrice) {
      content = <span style={{ color: 'green' }}>{content}</span>
    }

    let interactions = {}
    if (this.props.interactive !== false) {
      interactions = {
        onMouseDown: () => {
          this.setState({
            dragging: true,
            dragStart: idx,
            startDate: hour.hour,
            dragEnd: null,
            endDate: null
          })
        },
        onMouseUp: () => {
          this.setState({ dragEnd: idx, dragging: false, endDate: hour.hour })
          if (this.props.onChange) {
            const start = dayjs(this.state.startDate)
            let range = `${this.state.startDate}-${hour.hour}`
            if (start.isAfter(hour.hour)) {
              range = `${hour.hour}-${this.state.startDate}`
            }
            this.props.onChange({ range })
          }
        },
        onMouseOver: () => this.setState({ dragOver: idx })
      }
    }

    return (
      <div
        key={idx}
        className={`hour ${this.getClass(idx, hour)}`}
        {...interactions}
      >
        {/*<div>{date.hour()}</div>*/}
        <div>{date.format('MM-DD HH')}</div>
        <div>{content}</div>
      </div>
    )
  }

  // Get class for this hour, determining if e.g. it is selected
  getClass(idx, hour) {
    const initStart = this.state.dragStart,
      initEnd = this.state.dragging ? this.state.dragOver : this.state.dragEnd,
      start = initStart < initEnd ? initStart : initEnd,
      end = initStart < initEnd ? initEnd : initStart

    let cls = this.props.interactive === false ? '' : 'active',
      unselected = false

    if (idx === start && idx === end) {
      cls += ' single' // Single cell selected
    } else if (idx === start) {
      cls += ' start' // Start of selection
    } else if (idx === end) {
      cls += ' end' // End of selection
    } else if (idx > start && idx < end) {
      cls += ' mid' // Mid part of selection
    } else {
      cls += ' unselected'
      unselected = true
    }
    // if (idx % 7 === 6 || idx === lastDay - 1) {
    //   cls += ' end-row'
    // }


  // TODO: this seems to be based on days of weeK??

    if (!unselected && idx + 7 >= start && idx + 7 <= end) {
      cls += ' nbb'
    }
    if (!unselected && idx - 7 >= start && idx - 7 <= end) {
      cls += ' nbt'
    }
    if (hour.unavailable || hour.booked) {
      cls += ' unavailable'
    }

    return cls
  }
}

export default Calendar

require('react-styl')(`
  .weekCalendar
    margin-bottom: 2rem
    &.calendar-sm .days > .day
      height: auto
    .days
      display: grid
      grid-template-columns: repeat(7, 1fr);
      grid-template-rows: repeat(24, 1fr);
      grid-auto-flow: column;
      user-select: none
      > .empty.first-row
        border-bottom: 1px solid #c2cbd3
      > .hour
        height: 6vw
        min-height: 3.5rem
        color: #455d75
        font-size: 14px
        font-weight: normal
        padding: 0.25rem 0.5rem
        display: flex
        flex-direction: column;
        justify-content: space-between;
        min-width: 0

        border-style: solid
        border-color: #c2cbd3
        border-width: 0 0 1px 1px
        position: relative
        &.end-row
          border-right-width: 1px

        &.in-past,&.unavailable
          background-color: var(--pale-grey)
        &.unavailable
          div:nth-child(2)
            color: var(--light)

        > div:nth-child(2)
          font-weight: bold
          white-space: nowrap
          overflow: hidden
        &::after
          z-index: 1
          content: ""
          position: absolute
          border: 3px solid transparent
          top: -2px
          left: -2px
          right: -2px
          bottom: -2px
        &.active::after
          cursor: pointer
        &.active.unselected:hover
          &::after
            border: 3px solid black
        &.start,&.mid,&.end
          background-color: var(--pale-clear-blue)
        &.start::after
          border-width: 3px 3px 0 3px
          border-color: black
        &.mid::after
          border-width: 0 3px 0px 3px
          border-color: black
        &.end::after
          border-width: 0 3px 3px 3px
          border-color: black
        &.single::after
          border-width: 3px
          border-color: black
        &.nbb::after
          border-bottom-color: transparent
        &.nbt::after
          border-top-color: transparent
      &.inactive > div:hover
        &.start::after, &.end::after, &.mid::after
          border-color: blue
          border-width: 3px
          z-index: 3

    .day-header
      display: flex
      border-width: 1px 0
      border-style: solid
      border-color: #c2cbd3
      justify-content: space-between;
      text-align: center
      font-size: 14px
      font-weight: normal
      color: var(--bluey-grey)
      margin-top: 1rem;
      line-height: 2rem;
      > div
        flex: 1
        .day-column-name
          text-transform: uppercase
        .day-column-number
          font-size: 24px

    .week-chooser
      display: flex
      justify-content: space-between;
      font-family: Poppins
      font-size: 24px
      font-weight: 300
      .btn
        border-color: #c2cbd3
        &::before
          content: "";
          width: 0.75rem;
          height: 0.75rem;
          border-width: 0 0 1px 1px;
          border-color: #979797;
          border-style: solid;
          transform: rotate(45deg) translate(3px, -1px)
          display: inline-block;
        &.next::before
          transform: rotate(225deg) translate(1px, -2px)
        &:hover::before
          border-color: var(--white)
`)
