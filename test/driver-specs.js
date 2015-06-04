// transpile:mocha

import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import 'mochawait';
import 'request-promise'; // not used by this lib but a devDep of basedriver
import { FakeDriver } from '../..';
import { TEST_APP } from './helpers';

chai.use(chaiAsPromised);

chai.should();

describe('FakeDriver', () => {
  it('should not start a session when a unique session is already running', async () => {
    let d1 = new FakeDriver();
    let caps1 = {app: TEST_APP, uniqueApp: true};
    let [uniqueSession] = await d1.createSession(caps1, {});
    uniqueSession.should.be.a('string');
    let d2 = new FakeDriver();
    let otherSessionData = [d1.driverData];
    await d2.createSession({app: TEST_APP}, {}, otherSessionData)
            .should.eventually.be.rejectedWith(/unique/);
    await d1.deleteSession(uniqueSession);
  });
  it('should start a new session when another non-unique session is running', async () => {
    let d1 = new FakeDriver();
    let caps = {app: TEST_APP};
    let [session1Id] = await d1.createSession(caps, {});
    session1Id.should.be.a('string');
    let d2 = new FakeDriver();
    let otherSessionData = [d1.driverData];
    let [session2Id] = await d2.createSession({app: TEST_APP}, {}, otherSessionData);
    session2Id.should.be.a('string');
    session1Id.should.not.equal(session2Id);
    await d1.deleteSession(session1Id);
    await d2.deleteSession(session2Id);
  });
});
