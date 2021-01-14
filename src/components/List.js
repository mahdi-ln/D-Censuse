import React, { Component } from 'react';
import Web3 from 'web3';
import logo from '../logo.png';
import './App.css';
import Census from '../abis/Census.json';
import Navbar from './Navbar';
import detectEthereumProvider from '@metamask/detect-provider';
import ipfs from './ipfs';
import {withRouter} from 'react-router';





class List extends Component {
  constructor(props) {
    super(props);
    this.state = {
      account: '',
      productCount: 0,
      products: [],
      buffer: null,
      loading: true
    }
    this.captureFile = this.captureFile.bind(this);
    this.createProduct = this.createProduct.bind(this);
    this.familysubmit = this.familysubmit.bind(this);
    this.subm = this.subm.bind(this);
    this.rolechange = this.rolechange.bind(this);
  }

   componentWillMount() {
     this.loadWeb3();
     
  }

  async loadWeb3() {
    const provider = await detectEthereumProvider();
    if (provider) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
      this.loadBlockchainData()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
      this.loadBlockchainData()
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
          const marketplace = web3.eth.Contract(Census.abi, networkData.address);
          this.setState({ marketplace });
        
          //window.alert(marketplace.methods)
           var householdID = 0;
           var PastEvents = [];
          //window.alert(await marketplace.methods.getpersonsstruct().call());
          PastEvents = await marketplace.getPastEvents('ProductCreated', {filter: {wallet: this.state.account}})
             
             
          if (PastEvents.length >0) {
          householdID = await PastEvents[0].returnValues._householdID;
          }else {
            
            householdID =  await marketplace.methods.lasthouseholdID().call();
          }
          var member;
          member =  await marketplace.methods.personCount().call();
          //window.alert(householdID,'mem');
     //     var households = await marketplace.methods.households()
          // this.setState({ member })
          this.setState({ householdID });
          this.setState({ member });
          
          // Load products
           for (var i = 1; i <= member; i++) {
            const product =  await marketplace.methods.persons(i).call()
           this.setState({
              products: [...this.state.products, product]
            })
          } 
          this.setState({ loading: false});
        
        } else {
          window.alert('Marketplace contract not deployed to detected network. Switch to Ropsten')
        }

      }
    
      
    

     
    rolechange(event){
      this.rol = event.target.value
    }

  


  captureFile(event) {
    event.preventDefault()
    const file = event.target.files[0]
    const reader = new window.FileReader()
    reader.readAsArrayBuffer(file)
    reader.onloadend = () => {
      this.setState({ buffer: Buffer(reader.result) })
      console.log('buffer', this.state.buffer)
    }
  }
  async subm (event,name,race,_role,country) {
  event.preventDefault();
  var ha;
  await ipfs.files.add(this.state.buffer,  (error, result) => {
    if(error) {
      console.error(error);
      return;
    }
  ha =  result[0].hash
console.log(result[0].hash)
 this.createProduct(name, race, ha, _role, country, true)
  })
/*   let selectedValue;
  for (const rb of _role) {
    if (rb.checked) {
        selectedValue = rb.value;
        break;
    }
  } */
 
 }
createProduct(name, race, _photo, _role, country, alive) {
  this.setState({ loading: true })
  var vhash;
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
  //window.alert (name, race, "vhash", role, country, alive, this.state.householdID);
    



  // this.state.marketplace.methods.createPerson(name, race, photurl, role, country, alive, this.householdID).send({ from: this.state.account })
  // .once('receipt', (receipt) => {
  //   this.setState({ loading: false })
  // })
  const hid = this.state.householdID;

  this.state.marketplace.methods.createPerson(name, race, _photo, _role, country, alive, hid).send({ from: this.state.account})
  .once('receipt', (receipt) => {
    this.setState({ loading: false })
})
}



  familysubmit() {
    // this.setState({ loading: true })
    // this.state.marketplace.methods.familysubmit().send({ from: this.state.account})
    // .once('receipt', (receipt) => {
    //   this.setState({ loading: false })
    // })
  } 
  render() {
/*     while (this.products == undefined) {
      this.setState({ loading: false })
    } */
  
    return (
      <div>
        <Navbar account={this.state.account} />
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 d-flex">
              { this.state.loading
                ? <div id="loader" className="text-center"><p className="text-center">Loading...</p></div>
                :  <div id="content">
                <h1>list</h1>
 
                <p>Donation needed for improvment</p>
                <p>&nbsp;</p>
                <h2>Currently added</h2>
                <table className="table">
                  <thead>
                    <tr>
                      <th scope="col">hid</th>
                      <th scope="col">Name</th>
                      <th scope="col">Role</th>
                      <th scope="col">Race</th>
                      <th scope="col">Country</th>
                      <th scope="col"></th>
                    </tr>
                  </thead>
                  <tbody id="productList">
                    {        this.state.products.map((product, key) => {
          return(
            <tr key={key}>
              <th scope="row">{ product.householdID.toString() }</th>
              <td>{product.name}</td>
               <td>{product.role} </td>
               <td>{product.race}</td>  
              <td>{product.country}</td>
              <td>
              <img src={`https://ipfs.io/ipfs/${product.ipfsHash}`} alt="" width="50"/>
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

export default List;
