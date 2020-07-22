"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _namingStrategies = require("./naming-strategies");

var postgres = (models, options) => {
  if (!options.namingStrategy) {
    options.namingStrategy = new _namingStrategies.SnakeCaseNamingStrategy();
  }

  var {
    models: customModels = {}
  } = options;

  if (!customModels.User) {
    for (var column in models.User.schema.columns) {
      if (models.User.schema.columns[column].type === 'timestamp') {
        models.User.schema.columns[column].type = 'timestamptz';
      }
    }
  }

  if (!customModels.Account) {
    for (var _column in models.Account.schema.columns) {
      if (models.Account.schema.columns[_column].type === 'timestamp') {
        models.Account.schema.columns[_column].type = 'timestamptz';
      }
    }
  }

  if (!customModels.Session) {
    for (var _column2 in models.Session.schema.columns) {
      if (models.Session.schema.columns[_column2].type === 'timestamp') {
        models.Session.schema.columns[_column2].type = 'timestamptz';
      }
    }
  }

  if (!customModels.VerificationRequest) {
    for (var _column3 in models.VerificationRequest.schema.columns) {
      if (models.VerificationRequest.schema.columns[_column3].type === 'timestamp') {
        models.VerificationRequest.schema.columns[_column3].type = 'timestamptz';
      }
    }
  }
};

var mongodb = (models, options) => {
  if (!options.namingStrategy) {
    options.namingStrategy = new _namingStrategies.CamelCaseNamingStrategy();
  }

  var {
    models: customModels = {}
  } = options;

  if (!customModels.User) {
    delete models.User.schema.columns.id.type;
    models.User.schema.columns.id.objectId = true;
    delete models.User.schema.columns.email.unique;
    models.User.schema.indices = [{
      name: 'email',
      unique: true,
      sparse: true,
      columns: ['email']
    }];
  }

  if (!customModels.Account) {
    delete models.Account.schema.columns.id.type;
    models.Account.schema.columns.id.objectId = true;
    models.Account.schema.columns.userId.type = 'objectId';
  }

  if (!customModels.Session) {
    delete models.Session.schema.columns.id.type;
    models.Session.schema.columns.id.objectId = true;
    models.Session.schema.columns.userId.type = 'objectId';
  }

  if (!customModels.VerificationRequest) {
    delete models.VerificationRequest.schema.columns.id.type;
    models.VerificationRequest.schema.columns.id.objectId = true;
  }
};

var sqlite = (models, options) => {
  if (!options.namingStrategy) {
    options.namingStrategy = new _namingStrategies.SnakeCaseNamingStrategy();
  }

  var {
    models: customModels = {}
  } = options;

  if (!customModels.User) {
    for (var column in models.User.schema.columns) {
      if (models.User.schema.columns[column].type === 'timestamp') {
        models.User.schema.columns[column].type = 'datetime';
      }
    }
  }

  if (!customModels.Account) {
    for (var _column4 in models.Account.schema.columns) {
      if (models.Account.schema.columns[_column4].type === 'timestamp') {
        models.Account.schema.columns[_column4].type = 'datetime';
      }
    }
  }

  if (!customModels.Session) {
    for (var _column5 in models.Session.schema.columns) {
      if (models.Session.schema.columns[_column5].type === 'timestamp') {
        models.Session.schema.columns[_column5].type = 'datetime';
      }
    }
  }

  if (!customModels.VerificationRequest) {
    for (var _column6 in models.VerificationRequest.schema.columns) {
      if (models.VerificationRequest.schema.columns[_column6].type === 'timestamp') {
        models.VerificationRequest.schema.columns[_column6].type = 'datetime';
      }
    }
  }
};

var _default = (config, models, options) => {
  if (config.type && config.type.startsWith('mongodb') || config.url && config.url.startsWith('mongodb')) {
    mongodb(models, options);
  } else if (config.type && config.type.startsWith('postgres') || config.url && config.url.startsWith('postgres')) {
    postgres(models, options);
  } else if (config.type && config.type.startsWith('sqlite') || config.url && config.url.startsWith('sqlite')) {
    sqlite(models, options);
  } else {
    if (!options.namingStrategy) {
      options.namingStrategy = new _namingStrategies.SnakeCaseNamingStrategy();
    }
  }
};

exports.default = _default;