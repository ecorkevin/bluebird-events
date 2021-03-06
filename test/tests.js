var bluebirdEvents = require('../index'),
  should = require('should'),
  TestClass = require('./TestClass'),
  BPromise = require('bluebird'),
  TimeoutError = BPromise.TimeoutError;

function shouldNotResolveHere() {
  'Should not resolve'.should.be.false;
}

describe('Bluebird-Events used inside a class', function () {
  before(function () {
    this.testClass = new TestClass();
  });

  it('should resolve', function () {
    return this.testClass.shouldResolve();
  });

  it('should reject', function () {
    return this.testClass.shouldReject()
      .then(shouldNotResolveHere)
      .catch(function () {
        return true;
      });
  });

  it('should cancel', function () {
    return this.testClass.shouldCancel()
      .then(shouldNotResolveHere)
      .catch(function () {
        return true;
      });
  });

  it('should resolve with value', function () {
    return this.testClass.shouldResolveWithValue()
      .then(function (val) {
        val.should.equal('Some Value');
      });
  });

  it('should reject with Error', function () {
    return this.testClass.shouldRejectWithError()
      .then(shouldNotResolveHere)
      .catch(function (err) {
        err.message.should.equal('Some Error!');
        return true;
      });
  });

  it('should cancel with Error', function () {
    var prom = this.testClass.shouldCancelWithError();

    //promise should be pending
    prom.reflect().isPending().should.equal.true;

    //now cancel the promise
    this.testClass.cancel();

    return prom
      .then(shouldNotResolveHere)
      .catch(function (err) {
        err.message.should.equal('Some Error!');
        return true;
      });
  });
});

describe('Bluebird-Events used with emitter based object', function () {
  before(function () {
    this.testClass = new TestClass();
  });

  it('should resolve', function () {
    var prom = bluebirdEvents(this.testClass, {
      resolve: 'yay',
      reject: 'uh-oh',
      cancel: 'good-bye'
    });

    this.testClass.emit('yay');

    return prom;
  });

  it('should reject', function () {
    var prom = bluebirdEvents(this.testClass, {
      resolve: 'yay',
      reject: 'uh-oh',
      cancel: 'good-bye'
    });

    this.testClass.emit('uh-oh');

    return prom
      .then(shouldNotResolveHere)
      .catch(function () {
        return true;
      });
  });

  it('should cancel', function () {
    var prom = bluebirdEvents(this.testClass, {
      resolve: 'yay',
      reject: 'uh-oh',
      cancel: 'good-bye'
    });

    this.testClass.emit('good-bye');

    return prom
      .then(shouldNotResolveHere)
      .catch(function () {
        return true;
      });
  });

  it('should resolve with value', function () {
    var prom = bluebirdEvents(this.testClass, {
      resolve: 'yay',
      reject: 'uh-oh',
      cancel: 'good-bye'
    });

    this.testClass.emit('yay', 'Some Value');

    return prom
      .then(function (val) {
        val.should.equal('Some Value');
      });
  });

  it('should reject with an Error', function () {
    var prom = bluebirdEvents(this.testClass, {
      resolve: 'yay',
      reject: 'uh-oh',
      cancel: 'good-bye'
    });

    this.testClass.emit('uh-oh', new Error('Some Error'));

    return prom
      .then(shouldNotResolveHere)
      .catch(function (err) {
        err.message.should.equal('Some Error');
        return true;
      });
  });

  it('should cancel', function () {
    var prom = bluebirdEvents(this.testClass, {
      resolve: 'yay',
      reject: 'uh-oh',
      cancel: 'good-bye'
    });

    this.testClass.emit('good-bye', new Error('Some Error'));

    return prom
      .then(shouldNotResolveHere)
      .catch(function (err) {
        err.message.should.equal('Some Error');
        return true;
      });
  });
});

describe('Bluebird-Events used with mutliple events', function () {
  before(function () {
    this.testClass = new TestClass();
  });

  it('should resolve with both events', function () {
    var prom = bluebirdEvents(this.testClass, {
      resolve: ['success', 'anotherSuccess'],
      reject: ['bad', 'anotherBad'],
      cancel: ['cancel', 'anotherCancel']
    });

    this.testClass.emit('success');

    var prom2 = bluebirdEvents(this.testClass, {
      resolve: ['success', 'anotherSuccess'],
      reject: ['bad', 'anotherBad'],
      cancel: ['cancel', 'anotherCancel']
    });

    this.testClass.emit('anotherSuccess');

    return prom
      .return(prom2);
  });

  it('should reject with both events', function () {
    var self = this,
      prom = bluebirdEvents(this.testClass, {
        resolve: ['success', 'anotherSuccess'],
        reject: ['bad', 'anotherBad'],
        cancel: ['cancel', 'anotherCancel']
      });

    this.testClass.emit('bad');

    return prom
      .then(shouldNotResolveHere)
      .catch(function () {
        var prom2 = bluebirdEvents(self.testClass, {
          resolve: ['success', 'anotherSuccess'],
          reject: ['bad', 'anotherBad'],
          cancel: ['cancel', 'anotherCancel']
        });

        self.testClass.emit('anotherBad');

        return prom2;
      })
      .then(shouldNotResolveHere)
      .catch(function () {
        return true;
      });
  });

  it('should cancel with both events', function () {
    var self = this,
      prom = bluebirdEvents(this.testClass, {
        resolve: ['success', 'anotherSuccess'],
        reject: ['bad', 'anotherBad'],
        cancel: ['cancel', 'anotherCancel']
      });

    this.testClass.emit('cancel');

    return prom
      .then(shouldNotResolveHere)
      .catch(function () {
        var prom2 = bluebirdEvents(self.testClass, {
          resolve: ['success', 'anotherSuccess'],
          reject: ['bad', 'anotherBad'],
          cancel: ['cancel', 'anotherCancel']
        });

        self.testClass.emit('anotherCancel');

        return prom2;
      })
      .then(shouldNotResolveHere)
      .catch(function () {
        return true;
      });
  });

  it('should resolve with both events and values', function () {
    var prom = bluebirdEvents(this.testClass, {
      resolve: ['success', 'anotherSuccess'],
      reject: ['bad', 'anotherBad'],
      cancel: ['cancel', 'anotherCancel']
    });

    this.testClass.emit('success', 'Yay!');

    var prom2 = bluebirdEvents(this.testClass, {
      resolve: ['success', 'anotherSuccess'],
      reject: ['bad', 'anotherBad'],
      cancel: ['cancel', 'anotherCancel']
    });

    this.testClass.emit('anotherSuccess', 'Double Yay!');

    return prom
      .then(function (val) {
        val.should.equal('Yay!');
        return prom2;
      })
      .then(function (val) {
        val.should.equal('Double Yay!');
      });
  });

  it('should reject with both events and values', function () {
    var self = this,
      prom = bluebirdEvents(this.testClass, {
        resolve: ['success', 'anotherSuccess'],
        reject: ['bad', 'anotherBad'],
        cancel: ['cancel', 'anotherCancel']
      });

    this.testClass.emit('bad', new Error('Uh-Oh!'));

    return prom
      .then(shouldNotResolveHere)
      .catch(function (err) {
        err.message.should.equal('Uh-Oh!');

        var prom2 = bluebirdEvents(self.testClass, {
          resolve: ['success', 'anotherSuccess'],
          reject: ['bad', 'anotherBad'],
          cancel: ['cancel', 'anotherCancel']
        });

        self.testClass.emit('anotherBad', new Error('My Bad'));

        return prom2;
      })
      .then(shouldNotResolveHere)
      .catch(function (err) {
        err.message.should.equal('My Bad');
        return true;
      });
  });

  it('should cancel with both events and values', function () {
    var self = this,
      prom = bluebirdEvents(this.testClass, {
        resolve: ['success', 'anotherSuccess'],
        reject: ['bad', 'anotherBad'],
        cancel: ['cancel', 'anotherCancel']
      });

    this.testClass.emit('cancel', new Error('Good Bye!'));

    return prom
      .then(shouldNotResolveHere)
      .catch(function (err) {
        err.message.should.equal('Good Bye!');

        var prom2 = bluebirdEvents(self.testClass, {
          resolve: ['success', 'anotherSuccess'],
          reject: ['bad', 'anotherBad'],
          cancel: ['cancel', 'anotherCancel']
        });

        self.testClass.emit('anotherCancel', new Error('Goofy!'));

        return prom2;
      })
      .then(shouldNotResolveHere)
      .catch(function (err) {
        err.message.should.equal('Goofy!');
        return true;
      });
  });
});

describe('Bluebird-Events used with default events', function () {
  before(function () {
    this.testClass = new TestClass();
  });

  it('should resolve by listening for default "finish" event', function () {
    var prom = bluebirdEvents(this.testClass);

    this.testClass.emit('finish');

    return prom;
  });

  it('should reject by listening for default "error" event', function () {
    var prom = bluebirdEvents(this.testClass);

    this.testClass.emit('error');

    return prom
      .then(shouldNotResolveHere)
      .catch(function () {
        return true;
      });
  });
});

describe('Bluebird-Events used with disabled events', function () {
  before(function () {
    this.testClass = new TestClass();
  });

  it('should not resolve because of an emitted event', function () {
    var prom = bluebirdEvents(this.testClass, {
      resolve: false
    });

    this.testClass.emit('finish');

    return prom
      .timeout(100, 'Never resolved')
      .then(shouldNotResolveHere)
      .catch(TimeoutError, function (e) {
        e.message.should.equal('Never resolved');
        return true;
      });
  });

  it('should not reject because of an emitted event', function () {
    var prom = bluebirdEvents(this.testClass, {
      reject: false
    });

    this.testClass.emit('error');

    return prom
      .then(shouldNotResolveHere)
      .error(shouldNotResolveHere)
      .timeout(100, 'Never rejected')
      .catch(TimeoutError, function (e) {
        e.message.should.equal('Never rejected');
        return true;
      });
  });
});

describe('Util Functions', function () {
  describe('EventsToArray', function () {
    it('should convert a string to array', function () {
      var eventName = 'Hi';
      var events = bluebirdEvents.eventsToArray(eventName);
      eventName.should.equal('Hi');
      events.should.be.array;
      events.length.should.equal(1);
      events[0].should.equal('Hi');
    });

    it('should leave an array as array', function () {
      var eventNames = ['Hi', 'Bye'];
      var events = bluebirdEvents.eventsToArray(eventNames);
      eventNames.should.be.array;
      eventNames.length.should.equal(2);

      events.should.be.array;
      events.length.should.equal(2);
      events[0].should.equal('Hi');
      events[1].should.equal('Bye');

      events.should.equal(eventNames);
    });

    it('should fail if passed the wrong type', function () {
      should.throws(function () {
        bluebirdEvents.eventsToArray({});
      });
    });
  });
});
