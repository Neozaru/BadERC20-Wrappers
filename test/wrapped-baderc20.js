const truffleAssert = require('truffle-assertions');
const erc20TestSuite = require('erc20-test-suite');

function wrapperBehaviorTest(baseTokenInfo, wrappedTokenInfo) {
	contract(wrappedTokenInfo.symbol, (accounts) => {

		describe('Wrapper deposit/withdrawal behavior', () => {
	
			let baseToken;
			let wrappedToken;
	
			const account1 = accounts[1];
	
			const maxSolidityInt = web3.utils.toBN(2).pow(web3.utils.toBN(256)).sub(web3.utils.toBN(1));
	
			beforeEach(async () => {
				baseToken = await baseTokenInfo.artifact.new(accounts[0]);
				wrappedToken = await wrappedTokenInfo.artifact.new(baseToken.address);
			});
	
			describe('deposits', () => {
	
				beforeEach(async () => {
					await baseToken.mint(accounts[1], 500, {from: accounts[0]});
				});
	
				it(`should have 500 ${baseTokenInfo.symbol} in the first account`, async () => {
					const initialBalance = await baseToken.balanceOf.call(account1);
					assert.equal(500, initialBalance, `500 ${baseTokenInfo.symbol} weren't in the first account`);
				});
	
				it(`should have 0 ${wrappedTokenInfo.symbol} in the first account`, async () => {
					const initialBalance = await wrappedToken.balanceOf.call(account1);
					assert.equal(0, initialBalance, `0 ${wrappedTokenInfo.symbol} weren't in the first account`);
				});
	
				it(`should have 0 allowance in the first account`, async () => {
					const initialAllowance = await baseToken.allowance(account1, wrappedToken.address, {from: account1}); 
					assert.equal(0, initialAllowance, `Initial allowance should be 0`);
				});
	
				it(`should start with 0 initial supply`, async () => {
					const initialSupply = await wrappedToken.totalSupply.call();
					assert.equal(0, initialSupply, `The initial supply was different than 0`);
				});
	
				it(`should fail to deposit with 0 allowance`, async () => {
					truffleAssert.reverts(wrappedToken.deposit(100, {from: account1}));
				});
	
				it(`should fail to deposit with not enough allowance`, async () => {
					await baseToken.approve(accounts[0], 99, {from: account1});
					truffleAssert.reverts(wrappedToken.deposit(100, {from: account1}));
				});
	
				it(`should succeed to deposit with just enough allowance`, async () => {
					await baseToken.approve(wrappedToken.address, 100, {from: account1});
					await wrappedToken.deposit(100, {from: account1});
					const newWrappedBalance = await wrappedToken.balanceOf(account1, {from: account1});
					assert.equal(100, newWrappedBalance, `New wrapped balance doesn't reflect deposit`);
					const newBaseBalance = await baseToken.balanceOf(account1, {from: account1});
					assert.equal(400, newBaseBalance, `New ${baseTokenInfo.symbol} balance doesn't reflect deposit`);
					const newAllowance = await baseToken.allowance(account1, wrappedToken.address, {from: account1}); 
					assert.equal(0, newAllowance, `Allowance should be 0 (100-100) after tx`);
				});
	
				it(`should succeed to deposit once with more allowance`, async () => {
					await baseToken.approve(wrappedToken.address, 150, {from: account1});
					await wrappedToken.deposit(100, {from: account1});
					const newWrappedBalance = await wrappedToken.balanceOf(account1, {from: account1});
					assert.equal(100, newWrappedBalance, `New wrapped balance doesn't reflect deposit`);
					const newBaseBalance = await baseToken.balanceOf(account1, {from: account1});
					assert.equal(400, newBaseBalance, `New ${baseTokenInfo.symbol} balance doesn't reflect deposit`);
					const newAllowance = await baseToken.allowance(account1, wrappedToken.address, {from: account1}); 
					assert.equal(50, newAllowance, `Allowance should be 50 (150-100) after tx`);
				});
	
				it(`should succeed to deposit once with infinite allowance`, async () => {
					await baseToken.approve(wrappedToken.address, maxSolidityInt, {from: account1});
					await wrappedToken.deposit(100, {from: account1});
					const newWrappedBalance = await wrappedToken.balanceOf(account1, {from: account1});
					assert.equal(100, newWrappedBalance, `New wrapped balance doesn't reflect deposit`);
					const newBaseBalance = await baseToken.balanceOf(account1, {from: account1});
					assert.equal(400, newBaseBalance, `New ${baseTokenInfo.symbol} balance doesn't reflect deposit`);
				});
	
				it(`should change total supply after depositing once`, async () => {
					await baseToken.approve(wrappedToken.address, maxSolidityInt, {from: account1});
					await wrappedToken.deposit(100, {from: account1});
					const newTotalSupply = await wrappedToken.totalSupply();
					assert.equal(100, newTotalSupply, `New total supply doesn't reflect deposit`);
				});
	
				it(`should succeed to deposit twice with just enough allowance`, async () => {
					await baseToken.approve(wrappedToken.address, 150, {from: account1});
					await wrappedToken.deposit(100, {from: account1});
					await wrappedToken.deposit(50, {from: account1});
					const newWrappedBalance = await wrappedToken.balanceOf(account1, {from: account1});
					assert.equal(150, newWrappedBalance, `New wrapped balance doesn't reflect deposit`);
					const newBaseBalance = await baseToken.balanceOf(account1, {from: account1});
					assert.equal(350, newBaseBalance, `New ${baseTokenInfo.symbol} balance doesn't reflect deposit`);
					const newAllowance = await baseToken.allowance(account1, wrappedToken.address, {from: account1}); 
					assert.equal(0, newAllowance, `Allowance should be 0 (150-100-50) after tx`);
				});
	
				it(`should succeed to deposit twice with more allowance`, async () => {
					await baseToken.approve(wrappedToken.address, 400, {from: account1});
					await wrappedToken.deposit(100, {from: account1});
					await wrappedToken.deposit(50, {from: account1});
					const newWrappedBalance = await wrappedToken.balanceOf(account1, {from: account1});
					assert.equal(150, newWrappedBalance, `New wrapped balance doesn't reflect deposit`);
					const newBaseBalance = await baseToken.balanceOf(account1, {from: account1});
					assert.equal(350, newBaseBalance, `New ${baseTokenInfo.symbol} balance doesn't reflect deposit`);
					const newAllowance = await baseToken.allowance(account1, wrappedToken.address, {from: account1}); 
					assert.equal(250, newAllowance, `Allowance should be 250 (400-100-50) after tx`);
				});
	
				it(`should succeed to deposit twice with infinite allowance`, async () => {
					await baseToken.approve(wrappedToken.address, maxSolidityInt, {from: account1});
					await wrappedToken.deposit(100, {from: account1});
					await wrappedToken.deposit(50, {from: account1});
					const newWrappedBalance = await wrappedToken.balanceOf(account1, {from: account1});
					assert.equal(150, newWrappedBalance, `New wrapped balance doesn't reflect deposit`);
					const newBaseBalance = await baseToken.balanceOf(account1, {from: account1});
					assert.equal(350, newBaseBalance, `New ${baseTokenInfo.symbol} balance doesn't reflect deposit`);
				});
	
				it(`should change total supply after depositing twice`, async () => {
					await baseToken.approve(wrappedToken.address, maxSolidityInt, {from: account1});
					await wrappedToken.deposit(100, {from: account1});
					await wrappedToken.deposit(50, {from: account1});
					const newTotalSupply = await wrappedToken.totalSupply();
					assert.equal(150, newTotalSupply, `New total supply doesn't reflect deposit`);
				});
	
			});
	
			describe('withdrawals', () => {
	
				beforeEach(async () => {
					await baseToken.mint(accounts[1], 500, {from: accounts[0]});
					await baseToken.approve(wrappedToken.address, 500, {from: account1})
					await wrappedToken.deposit(500, {from: account1});
				});
	
				it(`should have 0 ${baseTokenInfo.symbol} in the first account`, async () => {
					const initialBalance = await baseToken.balanceOf.call(account1);
					assert.equal(0, initialBalance, `0 ${baseTokenInfo.symbol} weren't in the first account`);
				});
	
				it(`should have 500 ${wrappedTokenInfo.symbol} in the first account`, async () => {
					const initialBalance = await wrappedToken.balanceOf.call(account1);
					assert.equal(500, initialBalance, `500 ${wrappedTokenInfo.symbol} weren't in the first account`);
				});
	
				it(`should have 0 allowance in the first account`, async () => {
					const initialAllowance = await wrappedToken.allowance(account1, baseToken.address, {from: account1}); 
					assert.equal(0, initialAllowance, `Initial allowance should be 0`);
				});
	
				it(`should start with 500 initial supply`, async () => {
					const initialSupply = await wrappedToken.totalSupply.call();
					assert.equal(500, initialSupply, `The initial supply was different than 0`);
				});
	
				it(`should fail to withdraw more than balance`, async () => {
					truffleAssert.reverts(wrappedToken.withdraw(501, {from: account1}));
				});
	
				it(`should succeed to withdraw with just enough balance`, async () => {
					await wrappedToken.withdraw(500, {from: account1});
					const newWrappedBalance = await wrappedToken.balanceOf(account1, {from: account1});
					assert.equal(0, newWrappedBalance, `New ${wrappedTokenInfo.symbol} balance doesn't reflect deposit`);
					const newBaseBalance = await baseToken.balanceOf(account1, {from: account1});
					assert.equal(500, newBaseBalance, `New ${baseTokenInfo.symbol} balance doesn't reflect deposit`);
				});
	
				it(`should succeed to withdraw once with more balance`, async () => {
					await wrappedToken.withdraw(400, {from: account1});
					const newWrappedBalance = await wrappedToken.balanceOf(account1, {from: account1});
					assert.equal(100, newWrappedBalance, `New ${wrappedTokenInfo.symbol} balance doesn't reflect deposit`);
					const newBaseBalance = await baseToken.balanceOf(account1, {from: account1});
					assert.equal(400, newBaseBalance, `New ${baseTokenInfo.symbol} balance doesn't reflect deposit`);
				});
	
				it(`should change total supply after withdrawing once`, async () => {
					await wrappedToken.withdraw(100, {from: account1});
					const newTotalSupply = await wrappedToken.totalSupply();
					assert.equal(400, newTotalSupply, `New total supply doesn't reflect withdrawal`);
				});
	
				it(`should succeed to withdraw twice with just enough balance`, async () => {
					await wrappedToken.withdraw(400, {from: account1});
					await wrappedToken.withdraw(100, {from: account1});
					const newWrappedBalance = await wrappedToken.balanceOf(account1, {from: account1});
					assert.equal(0, newWrappedBalance, `New ${wrappedTokenInfo.symbol} balance doesn't reflect deposit`);
					const newBaseBalance = await baseToken.balanceOf(account1, {from: account1});
					assert.equal(500, newBaseBalance, `New ${baseTokenInfo.symbol} balance doesn't reflect deposit`);
				});
	
				it(`should succeed to withdraw twice with more balance`, async () => {
					await wrappedToken.withdraw(400, {from: account1});
					await wrappedToken.withdraw(50, {from: account1});
					const newWrappedBalance = await wrappedToken.balanceOf(account1, {from: account1});
					assert.equal(50, newWrappedBalance, `New ${wrappedTokenInfo.symbol} balance doesn't reflect deposit`);
					const newBaseBalance = await baseToken.balanceOf(account1, {from: account1})
					assert.equal(450, newBaseBalance, `New ${baseTokenInfo.symbol} balance doesn't reflect deposit`);
				});
	
				it(`should change total supply after withdrawing twice`, async () => {
					await wrappedToken.withdraw(100, {from: account1});
					await wrappedToken.withdraw(200, {from: account1});
					const newTotalSupply = await wrappedToken.totalSupply();
					assert.equal(200, newTotalSupply, `New total supply doesn't reflect withdrawals`);
				});
	
			});
	
		});
	
	});
}

function erc20BehaviorTest(baseTokenInfo, wrappedTokenInfo) {
	let baseToken = null;
	contract(wrappedTokenInfo.symbol, function(accounts) {
		let options = {
			// accounts to test with, accounts[0] being the contract owner
			accounts: accounts,
	
			// factory method to create new token contract
			create: async function () {
				baseToken = await baseTokenInfo.artifact.new(accounts[0]);
				return await wrappedTokenInfo.artifact.new(baseToken.address);
			},
	
			// Mints the original badERC20 token, then wraps it, then sends the wrapped token to dest
			mint: async function (wrappedToken, to, amount) {
				await baseToken.mint(accounts[0], amount, {from: accounts[0]});
				await baseToken.approve(wrappedToken.address, amount, {from: accounts[0]});
				await wrappedToken.deposit(amount, {from: accounts[0]});
				return await wrappedToken.transfer(to, amount, {from: accounts[0]});
			},
	
			// optional:
			// also test the increaseApproval/decreaseApproval methods (not part of the ERC-20 standard)
			increaseDecreaseApproval: false,
	    allowanceSendToSelf: false,
		};
	
		erc20TestSuite(options);
	});
}


module.exports = {
	wrapperBehaviorTest,
	erc20BehaviorTest,
}
