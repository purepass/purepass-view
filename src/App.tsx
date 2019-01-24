import { Purepass, PurepassOptions } from 'purepass-core';
import * as validate from 'purepass-validators';
import * as React from 'react';
import { Form } from 'semantic-ui-react';

const purepass = new Purepass();

export interface IProps {
  themeColour?: string;
}

interface IState {
  maxPasswordLength: number;
  maxPasswordLengthError: null | any;
  namespace: string;
  namespaceError: null | any;
  secret: string;
  secretError: null | any;
  specialCharacter: string;
  specialCharacterError: null | any;
}

class App extends React.Component<IProps, IState> {
  public formStyle = {display:'flex', flexDirection:'column', justifyContent:'spaceBetween', alignItems:'center'}

  constructor(props: IProps) {
    super(props);
    this.state = {
      maxPasswordLength: 64,
      maxPasswordLengthError:null,
      namespace: 'Un',
      namespaceError: null,
      secret: '',
      secretError: null,
      specialCharacter: '#',
      specialCharacterError: null
    };
  }
  

  public handleSecretChange = (ev: React.FormEvent<HTMLInputElement>) => {
    const val = ev.currentTarget.value;
    const error = validate.secret(val);
    if(error) {
      this.setState({ secretError: error.messageForHumans });
      return;
    }
    this.setState({ secret: val, secretError: null });
  }

  public handleNamespaceChange = (ev: React.FormEvent<HTMLInputElement>) => {
    const val = ev.currentTarget.value;
    const error = validate.namespace(val);
    if(error) {
      this.setState({ namespaceError: error.messageForHumans });
      return;
    }
    this.setState({ namespace: val, namespaceError: null });
  }

  public handleMaxPasswordLengthChange = (ev: React.FormEvent<HTMLInputElement>) => {
    const val = parseInt(ev.currentTarget.value, 10);
    const error = validate.maxPasswordLength(val);
    if(error) {
      this.setState({ maxPasswordLengthError: error.messageForHumans });
      return;
    }
    this.setState({ maxPasswordLength: val, maxPasswordLengthError: null });
  }

  public handleSpecialCharacterChange = (ev: React.FormEvent<HTMLInputElement>) => {
    const val = ev.currentTarget.value;
    const error = validate.specialCharacter(val);
    if(error) {
      this.setState({ specialCharacterError: error.messageForHumans });
      return;
    }
    this.setState({ specialCharacter: val, specialCharacterError: null });
  }
  
  public renderPurepass = () => {
    const { secret, namespace, specialCharacter, maxPasswordLength } = this.state;
    if(!secret){
      return (
        <div>Secret is required</div>
      )
    }
    const generatedPassword = purepass.generatePassword(secret, new PurepassOptions(namespace, specialCharacter, maxPasswordLength));
    return (
      <div>
        you're purepass is:
        <pre style={{fontSize:9}}>{generatedPassword}</pre>
      </div>
    );
  }
  public render() {
    return (
      <div style={{display:'flex', justifyContent:'center'}}>
        <div>
        <h1>Purepass</h1>
          <Form style={this.formStyle}>
            <Form.Field>
              <label>secret</label>
              <input placeholder="password1234" onChange={this.handleSecretChange} />
              <div style={{color:'red'}}>{this.state.secretError}</div>
            </Form.Field>
            
            <Form.Field>
              <label>namespace</label>
              <input placeholder="Un" onChange={this.handleNamespaceChange} />
              <div style={{color:'red'}}>{this.state.namespaceError}</div>
            </Form.Field>

            <Form.Field>
              <label>max character count</label>
              <input placeholder="64" onChange={this.handleMaxPasswordLengthChange}/>
              <div style={{color:'red'}}>{this.state.maxPasswordLengthError}</div>
            </Form.Field>

            <Form.Field>
              <label>special character</label>
              <input placeholder="#" onChange={this.handleSpecialCharacterChange}/>
              <div style={{color:'red'}}>{this.state.specialCharacterError}</div>
            </Form.Field>
            <div style={{display:'flex', justifyContent:'center'}}>{this.renderPurepass()}</div>
          </Form>
        </div>
      </div>
    );
  }
}

export default App;
