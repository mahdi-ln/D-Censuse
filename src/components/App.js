import React, { Component } from 'react';
import Web3 from 'web3';
import logo from '../logo.png';
import './App.css';
import Census from '../abis/Census.json';
import Navbar from './Navbar';
import List from './List';
import { HashRouter } from 'react-router-dom';
import detectEthereumProvider from '@metamask/detect-provider';



import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";
import ipfs from './ipfs';

class App extends Component {

  render () {
    return(
      

     <HashRouter>
      <Switch>
      <Route path="/list" component={List}>
        <List />
      </Route>
      <Route path="/" exact>
        <Home />
      </Route>
      <Route path="/add" exact>
        <Home />
      </Route>
      </Switch>
      </HashRouter>

    )
  }

  
}



class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      account: '',
      productCount: 0,
      products: [],
      photobuffer: null,
      kidproofbuffer: null,
      households: null,
      loading: true,
      role: ''
    }
    this.capturephoto = this.capturephoto.bind(this);
    this.captureproofofkids = this.captureproofofkids.bind(this);
    this.capturephoto = this.capturephoto.bind(this);
    this.createProduct = this.createProduct.bind(this);
    this.subm = this.subm.bind(this);
    this.rolechange = this.rolechange.bind(this);
    this.addfamily = this.addfamily.bind(this);
  }

   componentWillMount() {
     this.loadWeb3();
     
  }

  async loadWeb3() {
    const provider = await detectEthereumProvider();

    if (provider) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
      this.loadBlockchainData();
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
      this.loadBlockchainData();
    }

    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

   async loadBlockchainData() {
    const web3 = window.web3
    // Load account
    var networkData
    const accounts = await web3.eth.getAccounts()
      this.setState({ account: accounts[0] })
    const  networkId = await web3.eth.net.getId()
        networkData = Census.networks[networkId]
        if(networkData) {
          const marketplace = new web3.eth.Contract(Census.abi, networkData.address);
          this.setState({ marketplace });
        
          //window.alert(marketplace.methods)
           var householdID = 0;
           var PastEvents = [];
          //window.alert(await marketplace.methods.getpersonsstruct().call());
          PastEvents = await marketplace.getPastEvents('ProductCreated', {filter: {wallet: this.state.account},fromBlock: 0 })
             
             
          if (PastEvents.length >0) {
          householdID = await PastEvents[0].returnValues._householdID;
          }else {
            
            householdID =  await marketplace.methods.lasthouseholdID().call();
          }
          var member;
          member =  await marketplace.methods.getmemberslenght(householdID).call();
          //window.alert(householdID,'mem');
     //     var households = await marketplace.methods.households()
          // this.setState({ member })
          this.setState({ householdID });
          this.setState({ member });
          
          // Load products
           for (var i = 0; i < member; i++) {
            const id = await marketplace.methods.getfamilymember(householdID,i).call()
            const product =  await marketplace.methods.persons(id).call()
           this.setState({
              products: [...this.state.products, product]
            })
          } 
          this.setState({ loading: false});
        
        } else {
          window.alert('Marketplace contract not deployed to detected network. Switch to Oasis Ethereum')
        }

      }
    
      
    

     
    rolechange(event){
      this.setState({role : event.target.value}) 
    }
captureproofofkids(event,files){
  
if (event.target.files[0] && event){
  event.preventDefault()
this.setState({kidproofbuffer:this.captureFile(event.target.files)})
}
  }

   capturephoto(event,files){
    
    if (event.target.files[0] && event){
      event.preventDefault()
      const file = event.target.files[0]
      const reader = new window.FileReader()
       reader.readAsArrayBuffer(file)
      reader.onloadend = () => { 
        const buffer = Buffer(reader.result)
        console.log('buffer', buffer )
        this.setState({photobuffer : buffer})
        console.log('this.state.photobuffer',this.state.photobuffer) 
      }
      

    
    }
  }
  async captureFile(files) {
    
    const file = files[0]
    const reader = new window.FileReader()
    await reader.readAsArrayBuffer(file)
    reader.onloadend = () => { 
      const buffer = Buffer(reader.result)
      console.log('buffer', buffer )
      return buffer
    }
  }
  async subm (event,name,race,_role,country,_email) {
  event.preventDefault();
  var phash = "none";
var khash="";
  const NodeRSA = require('node-rsa');
  const key = new NodeRSA('-----BEGIN PUBLIC KEY-----MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCJ52qTquvPvRmgI3GwcuzkxDT6Jjp1BpLqh2auBq81F4NOk+QOuSP7FvbAFvnOiAPR4CndWMMmt3rN+JHqpBFKu63SW6miSnFEP5JshLMdN3RfZ/82q56itXVqIGnlyuWR/vLSZnxI/6FsOVkz/HJ64TL9l2j7jOIT/1IX8cM6aQIDAQAB-----END PUBLIC KEY-----');


const enc = key.encrypt(_email, 'base64');
 

  await ipfs.files.add(this.state.photobuffer,  async (error, result) => {
    if(error) {
      console.error(error);
      this.createProduct(name, race, phash,khash, _role, country, true, enc)
      return;
    }
   phash = result[0].hash
   console.log(result[0].hash)
   await ipfs.files.add(this.state.kidproofbuffer,  (error, resultk) => {
    if(error) {
      console.error(error);
      this.createProduct(name, race, phash,khash,  _role, country, true, enc)
      return;
    }
   khash = resultk[0].hash
   console.log(resultk[0].hash)
   this.createProduct(name, race, phash, khash, _role, country, true, enc)
  })
  })
  
 
/*   let selectedValue;
  for (const rb of _rolee) {
    if (rb.checked) {
        selectedValue = rb.value;
        break;
    }
  } */
 
 }
createProduct(name, race, _photo,_kidproofhash ,_role, country, alive,enc) {
  this.setState({ loading: true })
/*     async function uplo(_data) {
    var phot = await fleek.upload({
      apiKey: '1Rc+ytXp/AlF3LseOVgk7Q==',
        apiSecret: 'my-6sd3b5ZQCfUT++Aym8kSe6AtpD3w0QtQxQ3NBr8mgbg=',
        key: 'my-file-key',
        data: _data,
      });
      return await phot.hashV0;
  } */

  
    //vhash = uplo(photo);
  //window.alert (name, race, "vhash", rolee, country, alive, this.state.householdID);
    



  // this.state.marketplace.methods.createPerson(name, race, photurl, rolee, country, alive, this.householdID).send({ from: this.state.account })
  // .once('receipt', (receipt) => {
  //   this.setState({ loading: false })
  // })
  const hid = this.state.householdID;

  this.state.marketplace.methods.createPerson(name, race, _photo, _kidproofhash,_role, country, alive, hid,enc).send({ from: this.state.account})
  .once('receipt', (receipt) => {
    this.setState({ loading: false })
});
}



   addfamily() {
    
  
    // this.setState({ loading: true })
    // this.state.marketplace.methods.familysubmit().send({ from: this.state.account})
    // .once('receipt', (receipt) => {
    //   this.setState({ loading: false })
    // })
    window.alert('Currently you can only add one house hold. Donation needed for improvment')
  } 

  render() {

    return (
      <div>
        <Navbar account={this.state.account} />
        <div><br></br></div>
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 d-flex">
              { this.state.loading
                ? <div id="loader" className="text-center"><p className="text-center">Loading...</p></div>
                : <div id="content">
                  <p></p>
                <h1>Add Person</h1>
                <form onSubmit={(event) => {
                  event.preventDefault()
                  const country = this.country.value
                  const name = this.productName.value
                  const race = this.productRace.value
                  const photo =this.productPhoto
                  const role = this.state.role
                  const email = this.email.value
    
                  this.subm(event,name,race,role,country,email)
        
                }}>
                   <div className="form-group mr-sm-2">
                    <select 
                      id="country"
                      type="text"
                      ref={(input) => { this.country = input }}
                      className="form-controle"
                      placeholder="country"
                      required>
                      <option value="Afghanistan">Afghanistan</option>
                <option value="Åland Islands">Åland Islands</option>
                <option value="Albania">Albania</option>
                <option value="Algeria">Algeria</option>
                <option value="American Samoa">American Samoa</option>
                <option value="Andorra">Andorra</option>
                <option value="Angola">Angola</option>
                <option value="Anguilla">Anguilla</option>
                <option value="Antarctica">Antarctica</option>
                <option value="Antigua and Barbuda">Antigua and Barbuda</option>
                <option value="Argentina">Argentina</option>
                <option value="Armenia">Armenia</option>
                <option value="Aruba">Aruba</option>
                <option value="Australia">Australia</option>
                <option value="Austria">Austria</option>
                <option value="Azerbaijan">Azerbaijan</option>
                <option value="Bahamas">Bahamas</option>
                <option value="Bahrain">Bahrain</option>
                <option value="Bangladesh">Bangladesh</option>
                <option value="Barbados">Barbados</option>
                <option value="Belarus">Belarus</option>
                <option value="Belgium">Belgium</option>
                <option value="Belize">Belize</option>
                <option value="Benin">Benin</option>
                <option value="Bermuda">Bermuda</option>
                <option value="Bhutan">Bhutan</option>
                <option value="Bolivia">Bolivia</option>
                <option value="Bosnia and Herzegovina">Bosnia and Herzegovina</option>
                <option value="Botswana">Botswana</option>
                <option value="Bouvet Island">Bouvet Island</option>
                <option value="Brazil">Brazil</option>
                <option value="British Indian Ocean Territory">British Indian Ocean Territory</option>
                <option value="Brunei Darussalam">Brunei Darussalam</option>
                <option value="Bulgaria">Bulgaria</option>
                <option value="Burkina Faso">Burkina Faso</option>
                <option value="Burundi">Burundi</option>
                <option value="Cambodia">Cambodia</option>
                <option value="Cameroon">Cameroon</option>
                <option value="Canada">Canada</option>
                <option value="Cape Verde">Cape Verde</option>
                <option value="Cayman Islands">Cayman Islands</option>
                <option value="Central African Republic">Central African Republic</option>
                <option value="Chad">Chad</option>
                <option value="Chile">Chile</option>
                <option value="China">China</option>
                <option value="Christmas Island">Christmas Island</option>
                <option value="Cocos (Keeling) Islands">Cocos (Keeling) Islands</option>
                <option value="Colombia">Colombia</option>
                <option value="Comoros">Comoros</option>
                <option value="Congo">Congo</option>
                <option value="Congo, The Democratic Republic of The">Congo, The Democratic Republic of The</option>
                <option value="Cook Islands">Cook Islands</option>
                <option value="Costa Rica">Costa Rica</option>
                <option value="Cote D'ivoire">Cote D'ivoire</option>
                <option value="Croatia">Croatia</option>
                <option value="Cuba">Cuba</option>
                <option value="Cyprus">Cyprus</option>
                <option value="Czech Republic">Czech Republic</option>
                <option value="Denmark">Denmark</option>
                <option value="Djibouti">Djibouti</option>
                <option value="Dominica">Dominica</option>
                <option value="Dominican Republic">Dominican Republic</option>
                <option value="Ecuador">Ecuador</option>
                <option value="Egypt">Egypt</option>
                <option value="El Salvador">El Salvador</option>
                <option value="Equatorial Guinea">Equatorial Guinea</option>
                <option value="Eritrea">Eritrea</option>
                <option value="Estonia">Estonia</option>
                <option value="Ethiopia">Ethiopia</option>
                <option value="Falkland Islands (Malvinas)">Falkland Islands (Malvinas)</option>
                <option value="Faroe Islands">Faroe Islands</option>
                <option value="Fiji">Fiji</option>
                <option value="Finland">Finland</option>
                <option value="France">France</option>
                <option value="French Guiana">French Guiana</option>
                <option value="French Polynesia">French Polynesia</option>
                <option value="French Southern Territories">French Southern Territories</option>
                <option value="Gabon">Gabon</option>
                <option value="Gambia">Gambia</option>
                <option value="Georgia">Georgia</option>
                <option value="Germany">Germany</option>
                <option value="Ghana">Ghana</option>
                <option value="Gibraltar">Gibraltar</option>
                <option value="Greece">Greece</option>
                <option value="Greenland">Greenland</option>
                <option value="Grenada">Grenada</option>
                <option value="Guadeloupe">Guadeloupe</option>
                <option value="Guam">Guam</option>
                <option value="Guatemala">Guatemala</option>
                <option value="Guernsey">Guernsey</option>
                <option value="Guinea">Guinea</option>
                <option value="Guinea-bissau">Guinea-bissau</option>
                <option value="Guyana">Guyana</option>
                <option value="Haiti">Haiti</option>
                <option value="Heard Island and Mcdonald Islands">Heard Island and Mcdonald Islands</option>
                <option value="Holy See (Vatican City State)">Holy See (Vatican City State)</option>
                <option value="Honduras">Honduras</option>
                <option value="Hong Kong">Hong Kong</option>
                <option value="Hungary">Hungary</option>
                <option value="Iceland">Iceland</option>
                <option value="India">India</option>
                <option value="Indonesia">Indonesia</option>
                <option value="Iran, Islamic Republic of">Iran, Islamic Republic of</option>
                <option value="Iraq">Iraq</option>
                <option value="Ireland">Ireland</option>
                <option value="Isle of Man">Isle of Man</option>
                <option value="Israel">Israel</option>
                <option value="Italy">Italy</option>
                <option value="Jamaica">Jamaica</option>
                <option value="Japan">Japan</option>
                <option value="Jersey">Jersey</option>
                <option value="Jordan">Jordan</option>
                <option value="Kazakhstan">Kazakhstan</option>
                <option value="Kenya">Kenya</option>
                <option value="Kiribati">Kiribati</option>
                <option value="Korea, Democratic People's Republic of">Korea, Democratic People's Republic of</option>
                <option value="Korea, Republic of">Korea, Republic of</option>
                <option value="Kuwait">Kuwait</option>
                <option value="Kyrgyzstan">Kyrgyzstan</option>
                <option value="Lao People's Democratic Republic">Lao People's Democratic Republic</option>
                <option value="Latvia">Latvia</option>
                <option value="Lebanon">Lebanon</option>
                <option value="Lesotho">Lesotho</option>
                <option value="Liberia">Liberia</option>
                <option value="Libyan Arab Jamahiriya">Libyan Arab Jamahiriya</option>
                <option value="Liechtenstein">Liechtenstein</option>
                <option value="Lithuania">Lithuania</option>
                <option value="Luxembourg">Luxembourg</option>
                <option value="Macao">Macao</option>
                <option value="Macedonia, The Former Yugoslav Republic of">Macedonia, The Former Yugoslav Republic of</option>
                <option value="Madagascar">Madagascar</option>
                <option value="Malawi">Malawi</option>
                <option value="Malaysia">Malaysia</option>
                <option value="Maldives">Maldives</option>
                <option value="Mali">Mali</option>
                <option value="Malta">Malta</option>
                <option value="Marshall Islands">Marshall Islands</option>
                <option value="Martinique">Martinique</option>
                <option value="Mauritania">Mauritania</option>
                <option value="Mauritius">Mauritius</option>
                <option value="Mayotte">Mayotte</option>
                <option value="Mexico">Mexico</option>
                <option value="Micronesia, Federated States of">Micronesia, Federated States of</option>
                <option value="Moldova, Republic of">Moldova, Republic of</option>
                <option value="Monaco">Monaco</option>
                <option value="Mongolia">Mongolia</option>
                <option value="Montenegro">Montenegro</option>
                <option value="Montserrat">Montserrat</option>
                <option value="Morocco">Morocco</option>
                <option value="Mozambique">Mozambique</option>
                <option value="Myanmar">Myanmar</option>
                <option value="Namibia">Namibia</option>
                <option value="Nauru">Nauru</option>
                <option value="Nepal">Nepal</option>
                <option value="Netherlands">Netherlands</option>
                <option value="Netherlands Antilles">Netherlands Antilles</option>
                <option value="New Caledonia">New Caledonia</option>
                <option value="New Zealand">New Zealand</option>
                <option value="Nicaragua">Nicaragua</option>
                <option value="Niger">Niger</option>
                <option value="Nigeria">Nigeria</option>
                <option value="Niue">Niue</option>
                <option value="Norfolk Island">Norfolk Island</option>
                <option value="Northern Mariana Islands">Northern Mariana Islands</option>
                <option value="Norway">Norway</option>
                <option value="Oman">Oman</option>
                <option value="Pakistan">Pakistan</option>
                <option value="Palau">Palau</option>
                <option value="Palestinian Territory, Occupied">Palestinian Territory, Occupied</option>
                <option value="Panama">Panama</option>
                <option value="Papua New Guinea">Papua New Guinea</option>
                <option value="Paraguay">Paraguay</option>
                <option value="Peru">Peru</option>
                <option value="Philippines">Philippines</option>
                <option value="Pitcairn">Pitcairn</option>
                <option value="Poland">Poland</option>
                <option value="Portugal">Portugal</option>
                <option value="Puerto Rico">Puerto Rico</option>
                <option value="Qatar">Qatar</option>
                <option value="Reunion">Reunion</option>
                <option value="Romania">Romania</option>
                <option value="Russian Federation">Russian Federation</option>
                <option value="Rwanda">Rwanda</option>
                <option value="Saint Helena">Saint Helena</option>
                <option value="Saint Kitts and Nevis">Saint Kitts and Nevis</option>
                <option value="Saint Lucia">Saint Lucia</option>
                <option value="Saint Pierre and Miquelon">Saint Pierre and Miquelon</option>
                <option value="Saint Vincent and The Grenadines">Saint Vincent and The Grenadines</option>
                <option value="Samoa">Samoa</option>
                <option value="San Marino">San Marino</option>
                <option value="Sao Tome and Principe">Sao Tome and Principe</option>
                <option value="Saudi Arabia">Saudi Arabia</option>
                <option value="Senegal">Senegal</option>
                <option value="Serbia">Serbia</option>
                <option value="Seychelles">Seychelles</option>
                <option value="Sierra Leone">Sierra Leone</option>
                <option value="Singapore">Singapore</option>
                <option value="Slovakia">Slovakia</option>
                <option value="Slovenia">Slovenia</option>
                <option value="Solomon Islands">Solomon Islands</option>
                <option value="Somalia">Somalia</option>
                <option value="South Africa">South Africa</option>
                <option value="South Georgia and The South Sandwich Islands">South Georgia and The South Sandwich Islands</option>
                <option value="Spain">Spain</option>
                <option value="Sri Lanka">Sri Lanka</option>
                <option value="Sudan">Sudan</option>
                <option value="Suriname">Suriname</option>
                <option value="Svalbard and Jan Mayen">Svalbard and Jan Mayen</option>
                <option value="Swaziland">Swaziland</option>
                <option value="Sweden">Sweden</option>
                <option value="Switzerland">Switzerland</option>
                <option value="Syrian Arab Republic">Syrian Arab Republic</option>
                <option value="Taiwan, Province of China">Taiwan, Province of China</option>
                <option value="Tajikistan">Tajikistan</option>
                <option value="Tanzania, United Republic of">Tanzania, United Republic of</option>
                <option value="Thailand">Thailand</option>
                <option value="Timor-leste">Timor-leste</option>
                <option value="Togo">Togo</option>
                <option value="Tokelau">Tokelau</option>
                <option value="Tonga">Tonga</option>
                <option value="Trinidad and Tobago">Trinidad and Tobago</option>
                <option value="Tunisia">Tunisia</option>
                <option value="Turkey">Turkey</option>
                <option value="Turkmenistan">Turkmenistan</option>
                <option value="Turks and Caicos Islands">Turks and Caicos Islands</option>
                <option value="Tuvalu">Tuvalu</option>
                <option value="Uganda">Uganda</option>
                <option value="Ukraine">Ukraine</option>
                <option value="United Arab Emirates">United Arab Emirates</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="United States">United States</option>
                <option value="United States Minor Outlying Islands">United States Minor Outlying Islands</option>
                <option value="Uruguay">Uruguay</option>
                <option value="Uzbekistan">Uzbekistan</option>
                <option value="Vanuatu">Vanuatu</option>
                <option value="Venezuela">Venezuela</option>
                <option value="Viet Nam">Viet Nam</option>
                <option value="Virgin Islands, British">Virgin Islands, British</option>
                <option value="Virgin Islands, U.S.">Virgin Islands, U.S.</option>
                <option value="Wallis and Futuna">Wallis and Futuna</option>
                <option value="Western Sahara">Western Sahara</option>
                <option value="Yemen">Yemen</option>
                <option value="Zambia">Zambia</option>
                <option value="Zimbabwe">Zimbabwe</option>
                </select>
                </div>
                  <div className="form-group mr-sm-2">

                    <input
                      id="email"
                      type="text"
                      ref={(input) => { this.email = input }}
                      className="form-controle"
                      placeholder="Your email address (email address will be encrypted)"
                      
                      />
                  </div>
                  <div className="form-group mr-sm-2">
                    <input
                      id="Name"
                      type="text"
                      ref={(input) => { this.productName = input }}
                      className="form-controle"
                      placeholder="Name (optional)"
                      
                      />
                  </div>
                  <div className="form-group mr-sm-2">
                    <input list="Races"
                      id="Race"
                      type="text"
                      ref={(input) => { this.productRace = input }}
                      className="form-controle"
                      placeholder="race"
                      required >

                </input>
                <datalist id="Races">
                        <option value="White"/>
                <option value="West Asia"/>
                <option value="East Asia"/>
                <option value="Latino"/>
                <option value="Black"/>

                
                </datalist>
                  </div>
                  <div className="form-group mr-sm-2">
                    face photo &nbsp;
                 
{this.state.role== "spouse2" ?

<input
id="photo"
type="file"
ref={(input) => { this.productPhoto = input }}
className="form-controle"
placeholder="Prodphotouct "
accept="image/*"
onChange={this.capturephoto.bind(this.productPhoto)}

 />
 :
 <input
id="photo"
type="file"
ref={(input) => { this.productPhoto = input }}
className="form-controle"
placeholder="Prodphotouct "
accept="image/*"
onChange={this.capturephoto.bind(this.productPhoto)}
required
 />

}

           
                       

         
              
                      
                  </div>
                  <div className="form-group mr-sm-2">
                    <input
                      id="dead"
                      type="checkbox"
                      ref={(input) => { this.dead = input }}
                      className="form-controle"
                      placeholder="Product Price"
                       />
                      It is a death proof photo
                  </div>
          
                  <div onChange={ this.rolechange }>
                  <div className="form-group mr-sm-2">
                    <input
                      id="pspouse"
                      name="roleec"
                      type="radio"
                      
                      className="form-controle"
                      value="pspouse"
                      placeholder="Product Price"
                      required />
                      <label for="pspouse">spouse with photo</label><br></br>
                  </div>
                  <div className="form-group mr-sm-2">
                    <input
                      id="spouse2"
                      name="roleec"
                      type="radio"
                      
                      className="form-controle"
                      value="spouse2"
                      placeholder="Product Price"
                      
                      required />
                      <label for="spouse2">spouse 2</label><br></br>
                  </div>
                  <div className="form-group mr-sm-2">
                    <input
                      id="kid"
                      name="roleec"
                      type="radio"
                      
                      className="form-controle"
                      value="kid"
                      placeholder="Product Price"
                      required />
                      <label for="kid">kids</label><br></br>
                  </div>
        </div>
        <div className="toolti">
                  List of names (number) of children (Part of ID pages in some countries) - Optional: 
                  <span class="tooltiptext">Still kids photo is needed</span>
                  </div>
    
                  

                  <div className="form-group mr-sm-2">
                
<input
id="proofofkids"
type="file"
className="form-controle"
ref={(input) => { this.proofofkids = input }}
placeholder="Prodphotouct "
accept="video/*,image/*"
onChange={this.captureproofofkids.bind(this.proofofkids)}
/>
</div>


                 <button type="submit" className="btn btn-primary">Add family member</button>
                </form>
                <button type="submit" onClick={this.addfamily}>+ other household</button>
                <p>Donation needed for improvment</p>
                <p>&nbsp;</p>

                <h2>Currently added (Current household)</h2>
                <table className="table">
                  <thead>
                    <tr>
                      <th scope="col">hid</th>
                      <th scope="col">Name</th>
                      <th scope="col">Rolee</th>
                      <th scope="col">Race</th>
                      <th scope="col">Country</th>
                      <th scope="col">Photo</th>
                    </tr>
                  </thead>
                  <tbody id="productList">
                    {        this.state.products.map((product, key) => {
          return(
            <tr key={key}>
              <th scope="row">{ product.householdID.toString() }</th>
              <td>{product.name}</td>
               <td>{product.rolee} </td>
               <td>{product.race}</td>  
              <td>{product.country}</td>
              <td>
              <img src={`https://ipfs.io/ipfs/${product.ipfsHash}`} alt={product.ipfsHash} width="50"/>
                </td>
            </tr>
          );
        })}
              
              
              
                    
                  </tbody>
                </table>
              </div>
                    
              }
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
