
'use strict';
const FabricCAServices = require('fabric-ca-client');
const { FileSystemWallet, Gateway, X509WalletMixin } = require('fabric-network');
const fs = require('fs');
const path = require('path');

const ccpPath = './connection.json';
const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
const ccp = JSON.parse(ccpJSON);

async function main() {
    try {

        // Create a new CA client for interacting with the CA.
        const caURL = ccp.certificateAuthorities['ca1.example.com'].url;
        const ca = new FabricCAServices(caURL);

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const userExists = await wallet.exists('newUser');
        if (userExists) {
            console.log('An identity for the user "newUser" already exists in the wallet');
            return;
        }

        // Check to see if we've already enrolled the admin user.
        const adminExists = await wallet.exists('org1_admin');
        if (!adminExists) {
            console.log('An identity for the admin user "org1_admin" does not exist in the wallet');
            console.log('Run the enrollAdmin.js application before retrying');
            return;
        }

        // Create a new gateway for connecting to our peer node.
        console.log('Gateway Start');
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: 'org1_admin', discovery: { enabled: false } });
        console.log('Gateway End');

        // Get the CA client object from the gateway for interacting with the CA.
        // console.log('CA Start');
        // const ca = gateway.getClient().getCertificateAuthority();
        const adminIdentity = gateway.getCurrentIdentity();
        // console.log('CA Stop');

        // Register the user, enroll the user, and import the new identity into the wallet.
        const secret = await ca.register({ affiliation: 'org1.department1', enrollmentID: 'newUser', role: 'client' }, adminIdentity);
        const enrollment = await ca.enroll({ enrollmentID: 'newUser', enrollmentSecret: secret });
        const userIdentity = X509WalletMixin.createIdentity('Org1MSP', enrollment.certificate, enrollment.key.toBytes());
        
        console.log(typeof userIdentity);
        console.log(userIdentity);
        
        wallet.import('newUser', userIdentity);
        console.log('Successfully registered and enrolled user "newUser" and imported it into the wallet');

    } catch (error) {
        console.error(`Failed to register user "newUser": ${error}`);
        process.exit(1);
    }
}

main();
