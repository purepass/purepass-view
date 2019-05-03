import copy from 'copy-to-clipboard';
import Erric from 'easy-e';
import debounce from 'lodash.debounce';
import { Purepass, PurepassOptions } from 'purepass-core';
import * as validate from 'purepass-validators';
import * as React from 'react';
import ReactSVG from 'react-svg';
import { Form } from 'semantic-ui-react';

const purepass = new Purepass();

export interface IProps {
  themeColour?: string;
}

interface IState {
  copyIconColor: string;
  copyIconWidth: string;
  maxPasswordLength: number;
  maxPasswordLengthError: null | any;
  namespace: string;
  namespaceError: null | any;
  secret: string;
  secretError: null | any;
  specialCharacter: string;
  specialCharacterError: null | any;
}

const defaultCopyIconColor: string = '#A9A9A9'
const activelyCopying: string = 'rgb(17,138,22)'
const defaultCopyIconWidth: string = '24px'

const errorStyle: any = {
  color: '#f55151',
  fontSize: '1.25rem',
  marginTop: '0.25rem'
}

const labelStyle: any = {
  color: 'white'
}

const appContainerStyle: any = {
  backgroundColor: 'black',
  display: 'flex',
  justifyContent: 'center',
  marginTop: '1.5em'
}

const fixedFooterStyle: any = {
  bottom: '1em',
  color: 'whitesmoke',
  left: 0,
  position: 'fixed',
  textAlign: 'center',
  width: '100%'
}

class App extends React.Component<IProps, IState> {
  public formStyle = { alignItems: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'spaceBetween' }
  public namespaceDebounceInterval: number = 400 // may be generous
  constructor(props: IProps) {
    super(props);
    this.state = {
      copyIconColor: defaultCopyIconColor,
      copyIconWidth: defaultCopyIconWidth,
      maxPasswordLength: 64,
      maxPasswordLengthError: null,
      namespace: 'Un',
      namespaceError: null,
      secret: '',
      secretError: null,
      specialCharacter: '#',
      specialCharacterError: null
    };
  }

  public handleSecretChange = (val: string) => {
    const error = validate.secret(val);
    if (error) {
      this.setState({ secret: '', secretError: error.messageForHumans });
      return;
    }
    this.setState({ secret: val, secretError: null });
  }

  public handleNamespaceChange = (val: string) => {
    const debounceUpdate = debounce((value) => {
      const error = validate.namespace(value)
      const namespaceNull = (!value || !value.length)
      if (!namespaceNull && error) {
        // next line assumes namespace is defined
        if (error.code === 'purepass/validators/validate.namespace/(namespace.length!==2)') {
          error.setMessageForHumans('namespace must be left blank or 2 characters in length')
        }
        this.setState({ namespaceError: error.messageForHumans });
        return
      }
      this.setState({ namespace: val, namespaceError: null })
    }, this.namespaceDebounceInterval)
    debounceUpdate(val);
  }

  public handleMaxPasswordLengthChange = (valStr: string) => {

    const debounceUpdate = debounce((val) => {
      if (val === '') {
        this.setState({ maxPasswordLength: 64, maxPasswordLengthError: null });
        return
      }
      const value = parseInt(valStr, 10)
      const error = validate.maxPasswordLength(value);
      if (error) {
        if (error.code === 'purepass/valudateArgs/(maxPasswordLength<=13)') {
          error.setMessageForHumans('max password length should be at least 13 characters')
        }
        this.setState({ maxPasswordLengthError: error.messageForHumans });
        return
      }

      if (Number.isNaN(value)) {
        const typeError = new Erric('purepass-view/handleMaxPasswordLengthChange/input===NaN', 'max password length must be an integer', { input: valStr })
        this.setState({ maxPasswordLengthError: typeError.messageForHumans });
        return;
      }
      this.setState({ maxPasswordLength: value, maxPasswordLengthError: null });
    }, this.namespaceDebounceInterval)
    debounceUpdate(valStr);
  }

  public handleSpecialCharacterChange = (val: string) => {
    const error = validate.specialCharacter(val);
    if (error) {
      this.setState({ specialCharacterError: error.messageForHumans });
      return;
    }
    this.setState({ specialCharacter: val, specialCharacterError: null });
  }

  public copyToClipboardWithFeedback = (generatedPassword: string) => {
    copy(generatedPassword);

    this.setState({ copyIconColor: activelyCopying, copyIconWidth: '30px' }, () => {
      setInterval(() => { this.setState({ copyIconColor: defaultCopyIconColor, copyIconWidth: defaultCopyIconWidth }) }, 300)
    });
  }
  //
  public renderPurepass = () => {
    const { secret, namespace, specialCharacter, maxPasswordLength, copyIconColor, copyIconWidth } = this.state;
    if (!secret || !secret.length) {
      return (
        <div>Secret is required</div>
      )
    }
    const generatedPassword = purepass.generatePassword(secret, new PurepassOptions(namespace, specialCharacter, maxPasswordLength));

    // tslint:disable-next-line:jsx-no-lambda
    return (
      <div onClick={this.copyToClipboardWithFeedback.bind(this, generatedPassword, { debug: true })}>
        your purepass is:
        <pre style={{ fontSize: 9 }}>{generatedPassword}</pre>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <ReactSVG src="/fa-copy-reg.svg" svgStyle={{ width: copyIconWidth, color: copyIconColor }} />
        </div>
      </div>
    );
  }
  public render() {
    return (
      <div style={appContainerStyle}>
        <div>
          <img
            style={{ maxWidth: '180px' }}
            src="/purepass.png"
          />
          <Form style={this.formStyle}>
            <Form.Field>
              <label style={labelStyle}>secret</label>
              <input placeholder="password1234" onChange={
                // tslint:disable-next-line:jsx-no-lambda
                ({ target: { value } }) => { this.handleSecretChange(value) }}
              />
              <div style={errorStyle}>{this.state.secretError}</div>
            </Form.Field>

            <Form.Field>
              <label style={labelStyle}>namespace</label>
              <input placeholder="Un" onChange={
                // tslint:disable-next-line:jsx-no-lambda
                ({ target: { value } }) => { this.handleNamespaceChange(value) }} />
              <div style={errorStyle}>{this.state.namespaceError}</div>
            </Form.Field>

            <Form.Field>
              <label style={labelStyle}>max character count</label>
              <input placeholder="64" onChange={
                // tslint:disable-next-line:jsx-no-lambda
                ({ target: { value } }) => { this.handleMaxPasswordLengthChange(value) }}
              />
              <div style={{ color: 'red' }}>{this.state.maxPasswordLengthError}</div>
            </Form.Field>

            <Form.Field>
              <label style={labelStyle}>special character</label>
              <input placeholder="#" onChange={
                // tslint:disable-next-line:jsx-no-lambda
                ({ target: { value } }) => { this.handleSpecialCharacterChange(value) }}
              />
              <div style={errorStyle}>{this.state.specialCharacterError}</div>
            </Form.Field>
            <div style={{ display: 'flex', justifyContent: 'center', color: 'white' }}>{this.renderPurepass()}</div>
          </Form>
          <div><p style={fixedFooterStyle}>icon created by Glenn Arseneau !</p></div>
        </div>
      </div>
    );
  }
}

export default App;
