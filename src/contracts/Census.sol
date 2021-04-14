pragma solidity ^0.5.4;


contract Census {
    string public name;
    uint public personCount = 0;
    uint public lasthouseholdID;
    uint public test = 2;

    mapping(uint => Person) public persons;
    mapping(uint => Household) public households;
    mapping(uint => ho) public hos;

    struct Person {
        uint id;
        string name;
        string ipfsHash;
        
        string role;
        string race;
        string country;
        uint householdID;
        bool alive;
    }
    struct Household {
        uint hid;
        uint[] members;
        string encrypted_email;
        string proofofkids;
        address submitter;
    }
    struct ho
           {
               uint hid;
               Person[] member;
           }
event ProductCreated (
    address indexed wallet,
    uint _householdID 
);



    constructor() public {
        name = "DCensus";
    }

      function createPerson(string memory _name, string memory _race, string memory _ipfshash,string memory _proofofkidsipfshash, string memory _role, string memory _country, bool _alive, uint _householdID, string memory _encrypted_email) public {
         // Require a valid photo
         require(keccak256(bytes(_ipfshash)) != 0xf4915122cc2b3d2dae9e7d77a78c2eb0cef7b55de5c725eea56e2027332489e1 || keccak256(bytes( _role)) ==  0x50ca8b53ea5277703bbfec8fbaede0fe14c4111c00a30c567d6f9988a1dc2eb0);
        
        // Increment product count
        
        personCount ++;
        // Create the product
        persons[personCount] = Person(personCount, _name, _ipfshash, _role, _race, _country, _householdID, _alive);
        households[_householdID].members.push(personCount);
        households[_householdID].submitter = msg.sender;
        households[_householdID].encrypted_email = _encrypted_email;
        households[_householdID].proofofkids = _proofofkidsipfshash;
       
        
        lasthouseholdID++;
        // Trigger an event
        emit ProductCreated(msg.sender,_householdID);
    }
        
/*      function addmember(string memory _name, string memory _race, string memory _photourl,string memory _role, string memory _country, bool _alive, uint _householdID) public {
        // Require a valid photo
        
        // require(bytes(_photourl).length > 0);

     
        // Increment product count
        personCount ++;
        // Create the product
        households[_householdID].members.push(Person(personCount, _name, _photourl, _role, _race, _country,_householdID, _alive));
        
        // Trigger an event
        //emit ProductCreated(productCount, _Persons, _race, _country);
    } */
    function getmemberslenght(uint _householdID) view public returns (uint) {
        uint m; 
        m = households[_householdID].members.length; //it apeares you cannot directly return global varaibles
        return m;
    }
    function getfamilymember(uint _householdID, uint _member) view public returns (uint) {
        uint id;
        id = households[_householdID].members[_member];
        return id;
    }
  function withdraw () public {
	address payable owner = 0x7c05E7a08770dC55663084297E8b3E4a1d2294E4;
	owner.transfer(address(this).balance);

  } 

     function getpersonsstruct() public returns(string memory) {
           string memory m;
         //   hos[0].member[0]=persons[1];
           m = persons[1].name;
           return m;
    }
}
