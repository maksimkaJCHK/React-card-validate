import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import superagent from 'superagent';
import Input from './components/input/';
import Select from './components/select';
import Card from './components/card';
import Modal from './components/modal';
import { Months, Years } from './services/params';
import { Banks } from './services/banks';
import './css/card-form.scss';

const node = document.getElementById('app');

class App extends Component {
  constructor(props) {
    super(props);
    let { months, years } = this.props;
    this.submitForm = this.submitForm.bind(this);
    this.cInputVal = this.cInputVal.bind(this);
    this.cSelect = this.cSelect.bind(this);
    this.cvvChange= this.cvvChange.bind(this);
    this.nameChange = this.nameChange.bind(this);
    this.numberChange = this.numberChange.bind(this);
    this.cvvValidate = this.cvvValidate.bind(this);
    this.numberValidate = this.numberValidate.bind(this);
    this.blurF = this.blurF.bind(this);
    this.nameValidate = this.nameValidate.bind(this);
    this.hideList = this.hideList.bind(this);
    this.toggleList = this.toggleList.bind(this);
    this.validateSelect = this.validateSelect.bind(this);
    this.alarmTextSelect = this.alarmTextSelect.bind(this);
    this.closeModal = this.closeModal.bind(this);

    this.state = {
      //Значения инпутов
      bankId: null,
      loadModal: false,
      sendForm: false,
      isModal: false,
      textModal: null,
      cardNumber: {
        alarm: null,
        isAlarm: false,
        value: '',
        name: 'cardNumber'
      },
      cardName: {
        alarm: null,
        isAlarm: false,
        value: '',
        name: 'cardName'
      },
      cardCVV: {
        alarm: null,
        isAlarm: false,
        value: '',
        name: 'cardCVV'
      },
      cardMonth: {
        alarm: null,
        isAlarm: false,
        name: 'cardMonth',
        value: null,
        placeholder: 'Month',
        isVisible: false,
        items: months
      },
      cardYear: {
        alarm: null,
        isAlarm: false,
        name: 'cardYear',
        value: null,
        placeholder: 'Year',
        isVisible: false,
        items: years
      }
    };
  }

  // Общие служебные функции

  cInputVal(val, name, alarm) {
    this.setState({
      ...this.state,
      [name]: {
        ...this.state[name],
        value: val,
        alarm
      }
    });
  }

  blurF(name) {
    let alarm = this.state[name].alarm;
    this.setState({
      ...this.state,
      [name]: {
        ...this.state[name],
        isAlarm: alarm ? true : false
      }
    });
  }

  //Кнопка отправить
  closeModal() {
    this.setState({
      sendForm: false,
      isModal: false,
    });
  }

  submitForm(e) {
    e.preventDefault();
    let numberValid = this.numberValidate(this.state.cardNumber.value);
    let nameValid = this.nameValidate(this.state.cardName.value);
    let cvvValid = this.cvvValidate(this.state.cardCVV.value);
    let yearValid = this.alarmTextSelect(this.state.cardYear.name);
    let monthValid = this.alarmTextSelect(this.state.cardMonth.name);

    if(numberValid.alarmText || nameValid || cvvValid || yearValid || monthValid) {
      this.setState({
        bankId: numberValid.bankId,
        cardNumber: {
          ...this.state.cardNumber,
          alarm: numberValid.alarmText,
          isAlarm: numberValid.alarmText ? true : false,
        },
        cardName: {
          ...this.state.cardName,
          alarm: nameValid,
          isAlarm: nameValid ? true : false,
        },
        cardCVV: {
          ...this.state.cardCVV,
          alarm: cvvValid,
          isAlarm: cvvValid ? true : false,
        },
        cardMonth: {
          ...this.state.cardMonth,
          alarm: monthValid,
          isAlarm: monthValid ? true : false,
        },
        cardYear: {
          ...this.state.cardYear,
          alarm: yearValid,
          isAlarm: yearValid ? true : false,
        }
      });
    } else {
      this.setState({
        loadModal: true,
        sendForm: true,
      });
      superagent.get(`${ this.props.url }`)
      .send()
      .set('accept', 'json')
      .end((err, res) => {
        if(err == null) {
          let data = JSON.parse(res.text);
          this.setState({
            bankId: null,
            loadModal: false,
            sendForm: true,
            isModal: true,
            ...data
          });
          setTimeout(this.closeModal, 7000);
        }
      });
    }
  }

  //Функции и методы для селекта
  alarmTextSelect(name) {
    let { value } = this.state[name];
    let alarmText = null;
    if(!value) {
      alarmText = `The ${this.state[name].placeholder.toLowerCase()} field cannot be empty`;
    }

    return alarmText;
  }

  validateSelect(name) {
    let { value, isVisible, isAlarm } = this.state[name];
    let alarmText = null;
    if((!value && isVisible) || (!value && isAlarm)) {
      alarmText = `The ${this.state[name].placeholder.toLowerCase()} field cannot be empty`;
    }

    this.setState({
      ...this.state,
      [name]: {
        ...this.state[name],
        alarm: alarmText,
        isAlarm: alarmText ? true : false
      }
    });
  }

  cSelect(val, name) {
    this.setState({
      ...this.state,
      [name]: {
        ...this.state[name],
        value: val,
        alarm: null,
        isAlarm: false
      }
    });
  }

  toggleList(name) {
    this.setState((state) => {
      return {
        ...state,
        [name]: {
          ...state[name],
          isVisible: !state[name].isVisible
        }
      }
    }, this.validateSelect(name));
  }

  hideList(e, name) {
    if(e.target.getAttribute('name') != name) {
      this.setState((state) => {
        return {
          ...state,
          [name]: {
            ...state[name],
            isVisible: false
          }
        }
      });
    }
  }

  //Функции и методы для поля номер карты

  numberValidate(iVal) {
    let numberVal = iVal.toString().replace(/-/g, '');
    let banks = this.props.banks;
    let alarmText = null;
    let bankId = null;
    let alarmTextObj = {
      nullText: 'Card Number field cannot be empty',
      lessThan: 'Card Number cannot be less than 16 characters',
      anyBank: 'This number is not listed by any bank'
    }

    if(numberVal.length > 3) {
      let bank = banks.filter(el => {
        let fCard = el.cards.filter(card => {
          let fNumb = numberVal.substring(0, 6);
          return fNumb.indexOf(card.toString().substring(0, numberVal.length)) != -1;
        })
        return fCard.length
      });

      if(bank.length) {
        bankId = bank[0].id;
        alarmText = null
      } else {
        bankId = null;
        alarmText = alarmTextObj.anyBank;
      }
    } else {
      bankId = null;
    }

    if(numberVal.length < 16) {
      if(alarmText) {
        alarmText += ', '+alarmTextObj.lessThan.toLowerCase();
      } else {
        alarmText = alarmTextObj.lessThan;
      }
    }

    if(!numberVal.length) {
      alarmText = alarmTextObj.nullText;
    }

    return { alarmText,  bankId};
  }

  numberChange(e, name) {
    let iVal = e.target.value;
    iVal = iVal.replace(/\-/g, '');
    if(iVal.length > 16) {
      return false;
    }
    if(iVal.search(/[^0-9\-]/) >= 0) {
      return false;
    }
    iVal = iVal.replace(/(\d\d\d\d)(?=(\d)+([^\d]|$))/g, '$1-');
    if(iVal.search(/\-$/) > 0) {
      iVal = iVal.replace(/\-$/g, '');
    }

    let numberValidate = this.numberValidate(iVal);
    this.setState({
      ...this.state,
      bankId: numberValidate.bankId,
      [name]: {
        ...this.state[name],
        value: iVal,
        alarm: numberValidate.alarmText
      }
    });
  }

  //Функции и методы для поля cvv
  cvvValidate(val) {
    let alarmText = null;

    if(val.length<3) {
      alarmText = 'Сvv field must contain at least 3 characters';
    }

    if(!val.length) {
      alarmText = 'CVV field cannot be empty';
    }

    return alarmText
  }

  cvvChange(e, name) {
    let iVal = e.target.value;

    if(iVal.length > 4) {
      return false;
    }
    if(iVal.search(/[^0-9]/) >= 0) {
      return false;
    }

    let cssValidate = this.cvvValidate(iVal);
    this.cInputVal(iVal, name, cssValidate);
  }

  //Функции и методы для поля имя карты
  nameValidate(val) {
    let alarmText = null;

    if(val.length < 3) {
      alarmText = 'Card name field must contain at least 3 character';
    }

    if(!val.length) {
      alarmText = 'Card name field cannot be empty';
    }

    return alarmText;
  }

  nameChange(e, name) {
    let iVal = e.target.value;

    if(iVal.length>26) {
      return false;
    }
    if(iVal.search(/[А-Яа-яЁё]/) >= 0 || iVal.search(/[0-9]/) >= 0) {
      return false;
    }
    if(iVal.search(/[!@#\$%\&\^\*\(\)\[\]\{\}\.\,\-_=+"'\\\/:;<>\|~`№?]/) >= 0) {
      return false;
    }

    let nameValidate = this.nameValidate(iVal);
    this.cInputVal(iVal, name, nameValidate);
  }

  render() {
    let { cardNumber, cardName, cardCVV, cardMonth, cardYear, loadModal, sendForm, isModal, textModal } = this.state;
    let { banks } = this.props;

    return (
      <form className='card-form' onSubmit={ this.submitForm }>
        <Card banks = {banks} {...this.state} />
        <Input title = "Card Number" params = { cardNumber } cInputVal = { this.numberChange } bInput = { this.blurF } />
        <Input title = "Card Name" params = { cardName } cInputVal = { this.nameChange } bInput = { this.blurF } />
        <div className="row fullAlign">
          <div className="col-8-12 fullAlign">
            <label className="full">Expiration date</label>
            <Select params = { cardMonth } iClass = "col-6-12" cSelect = { this.cSelect } hideList = { this.hideList } toggleList = { this.toggleList } />
            <Select params = { cardYear } iClass = "col-6-12" cSelect = { this.cSelect } hideList = { this.hideList } toggleList = { this.toggleList } />
          </div>
          <Input title = "CVV" params = { cardCVV } cInputVal = { this.cvvChange } bInput = { this.blurF } iClass = "cvv col-4-12" />
        </div>
        <button className="btn subm">
          Submit
        </button>
        { sendForm ? <div className="blackout"></div> : null }
        { loadModal ? <div className="preloader"></div> : null }
        { isModal ? <Modal title = { textModal } /> : null}
      </form>
    )
  }
}

ReactDOM.render(
  <App months = { Months } years = { Years } banks = { Banks } url = '/json/good.json' />,
  node
)
