const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../server.js');

const should = chai.should();

chai.use(chaiHttp)


describe('/GET user', () => {
    it('it should Get all users', (done) => {
        chai.request(app)
        .get('/api/users')
        .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('object');
            done();
        });
    });
});
