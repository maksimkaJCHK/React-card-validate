import React, {Component} from 'react';
import './card.scss';

export default class Card extends Component {
  constructor(props) {
    super(props);
    this.preloadImage = this.preloadImage.bind(this);
    this.fBank = this.fBank.bind(this);
    this.fBankImg = this.fBankImg.bind(this);
    this.state = {
      cardIsloaded: true,
      bank: [],
      imgCard: `${this.fBankImg(this.props.bankId)}`
    };
  }

  componentDidMount() {
    this.preloadImage(this.props.bankId);
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if(nextProps.bankId != this.props.bankId) {
      this.preloadImage(nextProps.bankId);
    }
  }

  preloadImage(bankId) {
    let self = this;
    let imgCard = `${this.fBankImg(bankId)}`;
    let bank = this.fBank(bankId);
    let tmp = new Image();
    tmp.src = imgCard;

    this.setState({
      cardIsloaded: true
    });

    tmp.onload = function() {
      self.setState({
        cardIsloaded: false,
        imgCard,
        bank
      });
    }
  }

  fBank(bankId) {
    let { banks } = this.props;
    let fBank = banks.filter(el => el.id == bankId);
    return fBank;
  }

  fBankImg(bankId) {
    let fBank = this.fBank(bankId);
    let bankImg = (fBank.length) ? fBank[0].img : 'no-card.png';
    return `img/banks/${ bankImg }`;
  }

  render() {
    let { cardIsloaded, bank, imgCard } = this.state;
    let { cardMonth, cardYear, cardNumber} = this.props;
    let styleCard = {
      backgroundImage: `url(${ imgCard })`
    }
    let classWrap = cardIsloaded ? 'card-wrap load' : 'card-wrap';
    let fStr = cardNumber.value.substring(0, 4) + '####';
    let lStr = cardNumber.value.substring(15, 19) + '####';

    return (
      <div className = { classWrap }>
        <div className = 'card' style = { styleCard }>
          <div className="card-number">
            <span>{ fStr.substring(0, 4) }</span> #### #### <span>{ lStr.substring(0, 4) }</span>
          </div>
          <div className="card-name">
            <div className="card-title">Card Holder</div>
            <div className="card-text">
              { bank.length ? bank[0].name : 'Bank not defined' }
            </div>
          </div>
          <div className="card-date">
            <div className="card-title">Expires</div>
            <div className="card-text">
              { cardMonth.value == null ? 'MM' : (cardMonth.value < 10) ? ('0' + cardMonth.value):cardMonth.value } / { cardYear.value == null ? 'YY' : cardYear.value }
            </div>
          </div>
        </div>
        { cardIsloaded ? <div className="preloader"></div> : null }
      </div>
    )
  }
}