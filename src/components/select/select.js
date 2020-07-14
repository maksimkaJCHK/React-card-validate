import React, {Component} from 'react';
import './select.scss';

export default class Select extends Component {
  constructor(props) {
    super(props);
    this.hideList = this.hideList.bind(this);
    this.toggleList = this.toggleList.bind(this);
    this.checkItem = this.checkItem.bind(this);
  }

  componentDidMount() {
    document.body.addEventListener('click', this.hideList);
  }

  componentWillUnmount() {
    document.body.removeEventListener('click', this.hideList);
  }

  hideList(e) {
    let name = this.props.params.name;
    this.props.hideList(e, name);
  }

  toggleList() {
    let name = this.props.params.name;
    this.props.toggleList(name);
  }

  checkItem(e) {
    let checketVal = e.target.getAttribute('data-id');
    this.props.cSelect(checketVal, this.props.params.name);
  }

  render() {
    let { iClass, params: { alarm, name, value, placeholder, items, isVisible, isAlarm } } = this.props;
    let toggleClass = isVisible?' show':'';
    let listClass = 'select-menu' + toggleClass;
    let itemClass = 'select-item';
    let sValue = items.filter(el => el.id == value);

    return (
      <div className={iClass + ' select'} >
        <input type = 'text' readOnly name = { name } onClick = { this.toggleList } value = { (sValue.length ? sValue[0].name : placeholder) } />
        <div className = { listClass }>
          {
            items.map(el => {
              let iClass = (el.id == value) ? (itemClass + ' active') : itemClass;
              return (
                <div className = { iClass } key = { el.id } data-id = { el.id } onClick = { this.checkItem }>
                  { el.name }
                </div>
              )
            })
          }
        </div>
        { alarm && isAlarm ? <div className="alarm">{ alarm }</div> : null }
      </div>
    );
  }
}