/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const chai = require('chai');
const path = require('path');
const tmp = require('tmp-promise');
const fs = require('fs');
const should = require('chai').should();

const Template = require('@accordproject/cicero-core').Template;

chai.should();
chai.use(require('chai-things'));
chai.use(require('chai-as-promised'));

const Commands = require('../lib/commands');

const template = path.resolve(__dirname, 'data/latedeliveryandpenalty/');
const templateJs = path.resolve(__dirname, 'data/latedeliveryandpenalty_js/');
const templateArchive = path.resolve(__dirname, 'data/latedeliveryandpenalty.cta');
const sample = path.resolve(__dirname, 'data/latedeliveryandpenalty/', 'text/sample.md');
const data = path.resolve(__dirname, 'data/latedeliveryandpenalty/', 'data.json');
const request = path.resolve(__dirname, 'data/latedeliveryandpenalty/', 'request.json');
const params = path.resolve(__dirname, 'data/latedeliveryandpenalty/', 'params.json');
const state = path.resolve(__dirname, 'data/latedeliveryandpenalty/', 'state.json');
const dataOut = path.resolve(__dirname, 'data/latedeliveryandpenalty/', 'data_out.json');
const sampleOut = path.resolve(__dirname, 'data/latedeliveryandpenalty/', 'text/sample_out.md');
const sampleOutJson = path.resolve(__dirname, 'data/latedeliveryandpenalty/', 'sample_out.json');
const parseReponse = {
    '$class':'org.accordproject.latedeliveryandpenalty.TemplateModel',
    'forceMajeure':true,
    'penaltyDuration':{
        '$class':'org.accordproject.time.Duration',
        'amount':9,
        'unit':'days'
    },
    'penaltyPercentage':7,
    'capPercentage':2,
    'termination':{
        '$class':'org.accordproject.time.Duration',
        'amount':2,
        'unit':'weeks'
    },
    'fractionalPart':'days'
};
const draftResponse = 'Late Delivery and Penalty. In case of delayed delivery except for Force Majeure cases, the Seller shall pay to the Buyer for every 9 days of delay penalty amounting to 7.0% of the total value of the Equipment whose delivery has been delayed. Any fractional part of a days is to be considered a full days. The total amount of penalty shall not however, exceed 2.0% of the total value of the Equipment involved in late delivery. If the delay is more than 2 weeks, the Buyer is entitled to terminate this Contract.';

const sampleErr = path.resolve(__dirname, 'data/latedeliveryandpenalty/', 'text/sample_err.md');
const dataErr = path.resolve(__dirname, 'data/latedeliveryandpenalty/', 'data_err.json');
const stateErr = path.resolve(__dirname, 'data/latedeliveryandpenalty/', 'state_err.json');
const requestErr = path.resolve(__dirname, 'data/latedeliveryandpenalty/', 'request_err.json');
const paramsErr = path.resolve(__dirname, 'data/latedeliveryandpenalty/', 'params_err.json');

describe('#validateParseArgs', () => {
    it('no args specified', () => {
        process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/'));
        const args  = Commands.validateParseArgs({
            _: ['parse'],
        });
        args.template.should.match(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty$/);
        args.sample.should.match(/text[/\\]sample.md$/);
    });
    it('all args specified', () => {
        process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/'));
        const args  = Commands.validateParseArgs({
            _: ['parse'],
            template: './',
            sample: 'text/sample.md'
        });
        args.template.should.match(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty$/);
        args.sample.should.match(/text[/\\]sample.md$/);
    });
    it('all args specified, parent folder', () => {
        process.chdir(path.resolve(__dirname, 'data/'));
        const args  = Commands.validateParseArgs({
            _: ['parse'],
            template: 'latedeliveryandpenalty',
            sample: 'latedeliveryandpenalty/text/sample.md'
        });
        args.template.should.match(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty$/);
        args.sample.should.match(/text[/\\]sample.md$/);
    });
    it('all args specified, archive', () => {
        process.chdir(path.resolve(__dirname, 'data/'));
        const args  = Commands.validateParseArgs({
            _: ['parse'],
            template: 'latedeliveryandpenalty.cta',
            sample: 'latedeliveryandpenalty/text/sample.md'
        });
        args.template.should.match(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty.cta$/);
        args.sample.should.match(/text[/\\]sample.md$/);
    });
    it('all args specified, parent folder, no sample', () => {
        process.chdir(path.resolve(__dirname, 'data/'));
        const args  = Commands.validateParseArgs({
            _: ['parse'],
            template: 'latedeliveryandpenalty',
        });
        args.template.should.match(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty$/);
        args.sample.should.match(/text[/\\]sample.md$/);
    });
    it('all args specified, child folder, no sample', () => {
        process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/text'));
        const args  = Commands.validateParseArgs({
            _: ['parse'],
            template: '../',
        });
        args.template.should.match(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty$/);
        args.sample.should.match(/text[/\\]sample.md$/);
    });
    it('no flags specified', () => {
        const args  = Commands.validateParseArgs({
            _: ['parse', path.resolve(__dirname, 'data/latedeliveryandpenalty/')],
        });
        args.template.should.match(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty$/);
        args.sample.should.match(/text[/\\]sample.md$/);
    });
    it('verbose flag specified', () => {
        process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/'));
        Commands.validateParseArgs({
            _: ['parse'],
            verbose: true
        });
    });
    it('bad package.json', () => {
        process.chdir(path.resolve(__dirname, 'data/'));
        (() => Commands.validateParseArgs({
            _: ['parse'],
        })).should.throw(' not a valid cicero template. Make sure that package.json exists and that it has a cicero entry.');
    });
    it('bad sample.md', () => {
        process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/'));
        (() => Commands.validateParseArgs({
            _: ['parse'],
            sample: 'text/sample_en.md'
        })).should.throw('A text/sample.md file is required. Try the --sample flag or create a text/sample.md in your template.');
    });
});

describe('#parse', () => {
    it('should parse a clause using a template', async () => {
        const result = await Commands.parse(template, sample, null);
        delete result.clauseId;
        delete result.$identifier;
        result.should.eql(parseReponse);
    });

    it('should parse a clause using a template archive', async () => {
        const result = await Commands.parse(templateArchive, sample, null);
        delete result.clauseId;
        delete result.$identifier;
        result.should.eql(parseReponse);
    });

    it('should fail parsing a clause using a template', async () => {
        const result = await Commands.parse(template, sampleErr, null);
        should.equal(result,undefined);
    });
});

describe('#parse-output', async () => {
    it('should parse a clause using a template and save to a JSON file', async () => {
        const result = await Commands.parse(template, sample, dataOut);
        delete result.clauseId;
        delete result.$identifier;
        result.should.eql(parseReponse);
    });
});

describe('#validateDraftArgs', () => {
    it('no args specified', () => {
        process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/'));
        const args  = Commands.validateDraftArgs({
            _: ['draft'],
        });
        args.template.should.match(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty$/);
        args.data.should.match(/data.json$/);
    });
    it('all args specified', () => {
        process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/'));
        const args  = Commands.validateDraftArgs({
            _: ['draft'],
            template: './',
            data: 'data.json'
        });
        args.template.should.match(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty$/);
        args.data.should.match(/data.json$/);
    });
    it('all args specified, parent folder', () => {
        process.chdir(path.resolve(__dirname, 'data/'));
        const args  = Commands.validateDraftArgs({
            _: ['draft'],
            template: 'latedeliveryandpenalty',
            data: 'latedeliveryandpenalty/data.json'
        });
        args.template.should.match(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty$/);
        args.data.should.match(/data.json$/);
    });
    it('all args specified, archive', () => {
        process.chdir(path.resolve(__dirname, 'data/'));
        const args  = Commands.validateDraftArgs({
            _: ['draft'],
            template: 'latedeliveryandpenalty.cta',
            data: 'latedeliveryandpenalty/data.json'
        });
        args.template.should.match(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty.cta$/);
        args.data.should.match(/data.json$/);
    });
    it('all args specified, parent folder, no sample', () => {
        process.chdir(path.resolve(__dirname, 'data/'));
        const args  = Commands.validateDraftArgs({
            _: ['draft'],
            template: 'latedeliveryandpenalty',
        });
        args.template.should.match(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty$/);
        args.data.should.match(/data.json$/);
    });
    it('all args specified, child folder, no sample', () => {
        process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/text'));
        const args  = Commands.validateDraftArgs({
            _: ['draft'],
            template: '../',
        });
        args.template.should.match(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty$/);
        args.data.should.match(/data.json$/);
    });
    it('no flags specified', () => {
        const args  = Commands.validateDraftArgs({
            _: ['draft', path.resolve(__dirname, 'data/latedeliveryandpenalty/')],
        });
        args.template.should.match(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty$/);
        args.data.should.match(/data.json$/);
    });
    it('verbose flag specified', () => {
        process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/'));
        Commands.validateDraftArgs({
            _: ['draft'],
            verbose: true
        });
    });
    it('bad package.json', () => {
        process.chdir(path.resolve(__dirname, 'data/'));
        (() => Commands.validateDraftArgs({
            _: ['draft'],
        })).should.throw(' not a valid cicero template. Make sure that package.json exists and that it has a cicero entry.');
    });
    it('bad data.json', () => {
        process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/'));
        (() => Commands.validateDraftArgs({
            _: ['draft'],
            data: 'data_en.json'
        })).should.throw('A data.json file is required. Try the --data flag or create a data.json in your template.');
    });
});

describe('#draft', () => {
    it('should create the text for a clause using a template', async () => {
        const result = await Commands.draft(template, data, null);
        delete result.clauseId;
        delete result.$identifier;
        result.should.eql(draftResponse);
    });

    it('should create the text for a clause using a template archive', async () => {
        const result = await Commands.draft(templateArchive, data, null);
        delete result.clauseId;
        delete result.$identifier;
        result.should.eql(draftResponse);
    });

    it('should fail drafting the text for a clause using a template', async () => {
        const result = await Commands.draft(template, dataErr, null);
        should.equal(result,undefined);
    });
});

describe('#draft-output', async () => {
    it('should create the text for a clause using a template and save to a file', async () => {
        const result = await Commands.draft(template, data, sampleOut);
        delete result.clauseId;
        delete result.$identifier;
        result.should.eql(draftResponse);
    });

    it('should create the slate for a clause using a template and save to a JSON file', async () => {
        const result = await Commands.draft(template, data, sampleOutJson, null, null, { format: 'slate' });
        delete result.clauseId;
        delete result.$identifier;
        result.should.not.be.null;
    });

    it('should create the slate for a ciceromark_parsed using a template and save to a JSON file', async () => {
        const result = await Commands.draft(template, data, sampleOutJson, null, null, { format: 'ciceromark_parsed' });
        delete result.clauseId;
        delete result.$identifier;
        result.should.not.be.null;
    });
});

describe('#validateNormalizeArgs', () => {
    it('no args specified', () => {
        process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/'));
        const args  = Commands.validateNormalizeArgs({
            _: ['normalize'],
        });
        args.template.should.match(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty$/);
        args.sample.should.match(/text[/\\]sample.md$/);
    });
    it('all args specified', () => {
        process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/'));
        const args  = Commands.validateNormalizeArgs({
            _: ['normalize'],
            template: './',
            sample: 'text/sample.md'
        });
        args.template.should.match(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty$/);
        args.sample.should.match(/text[/\\]sample.md$/);
    });
    it('all args specified, parent folder', () => {
        process.chdir(path.resolve(__dirname, 'data/'));
        const args  = Commands.validateNormalizeArgs({
            _: ['normalize'],
            template: 'latedeliveryandpenalty',
            sample: 'latedeliveryandpenalty/text/sample.md'
        });
        args.template.should.match(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty$/);
        args.sample.should.match(/text[/\\]sample.md$/);
    });
    it('all args specified, archive', () => {
        process.chdir(path.resolve(__dirname, 'data/'));
        const args  = Commands.validateNormalizeArgs({
            _: ['normalize'],
            template: 'latedeliveryandpenalty.cta',
            sample: 'latedeliveryandpenalty/text/sample.md'
        });
        args.template.should.match(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty.cta$/);
        args.sample.should.match(/text[/\\]sample.md$/);
    });
    it('all args specified, parent folder, no sample', () => {
        process.chdir(path.resolve(__dirname, 'data/'));
        const args  = Commands.validateNormalizeArgs({
            _: ['normalize'],
            template: 'latedeliveryandpenalty',
        });
        args.template.should.match(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty$/);
        args.sample.should.match(/text[/\\]sample.md$/);
    });
    it('all args specified, child folder, no sample', () => {
        process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/text'));
        const args  = Commands.validateNormalizeArgs({
            _: ['normalize'],
            template: '../',
        });
        args.template.should.match(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty$/);
        args.sample.should.match(/text[/\\]sample.md$/);
    });
    it('no flags specified', () => {
        const args  = Commands.validateNormalizeArgs({
            _: ['normalize', path.resolve(__dirname, 'data/latedeliveryandpenalty/')],
        });
        args.template.should.match(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty$/);
        args.sample.should.match(/text[/\\]sample.md$/);
    });
    it('verbose flag specified', () => {
        process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/'));
        Commands.validateNormalizeArgs({
            _: ['normalize'],
            verbose: true
        });
    });
    it('bad package.json', () => {
        process.chdir(path.resolve(__dirname, 'data/'));
        (() => Commands.validateNormalizeArgs({
            _: ['normalize'],
        })).should.throw(' not a valid cicero template. Make sure that package.json exists and that it has a cicero entry.');
    });
    it('bad sample.md', () => {
        process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/'));
        (() => Commands.validateNormalizeArgs({
            _: ['normalize'],
            sample: 'text/sample_en.md'
        })).should.throw('A text/sample.md file is required. Try the --sample flag or create a text/sample.md in your template.');
    });
    it('output specified', () => {
        process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/'));
        const args  = Commands.validateNormalizeArgs({
            _: ['normalize'],
            output: sampleOut,
        });
        args.template.should.match(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty$/);
        args.output.should.match(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty[/\\]text[/\\]sample_out.md$/);
        args.sample.should.match(/text[/\\]sample.md$/);
    });
    it('overwrite specified', () => {
        process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/'));
        const args  = Commands.validateNormalizeArgs({
            _: ['normalize'],
            overwrite: true,
        });
        args.template.should.match(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty$/);
        args.output.should.match(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty[/\\]text[/\\]sample.md$/);
        args.sample.should.match(/text[/\\]sample.md$/);
    });
    it('both output and overwrite specified', () => {
        process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/'));
        (() => Commands.validateNormalizeArgs({
            _: ['normalize'],
            output: sampleOut,
            overwrite: true,
        })).should.throw('Cannot use both --overwrite and --output');
    });
});

describe('#normalize', () => {
    it('should normalize a clause using a template', async () => {
        const result = await Commands.normalize(template, sample, false, null);
        delete result.clauseId;
        delete result.$identifier;
        result.should.eql(draftResponse);
    });

    it('should normalize a clause using a template archive', async () => {
        const result = await Commands.normalize(templateArchive, sample, false, null);
        delete result.clauseId;
        delete result.$identifier;
        result.should.eql(draftResponse);
    });

    it('should fail normalizing a clause using a template', async () => {
        const result = await Commands.normalize(template, sampleErr, false, null);
        should.equal(result,undefined);
    });
});

describe('#normalize-output', async () => {
    it('should parse a clause using a template and save to a JSON file', async () => {
        const result = await Commands.normalize(template, sample, false, dataOut);
        result.should.eql(draftResponse);
    });
});

describe('#validateTriggerArgs', () => {
    it('no args specified', () => {
        process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/'));
        const args  = Commands.validateTriggerArgs({
            _: ['trigger'],
        });
        args.template.should.match(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty$/);
    });
    it('all args specified except data', () => {
        process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/'));
        const args  = Commands.validateTriggerArgs({
            _: ['trigger'],
            template: './',
            sample: 'text/sample.md',
            state: 'state.json'
        });
        args.template.should.match(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty$/);
        args.sample.should.match(/text[/\\]sample.md$/);
        args.state.should.match(/state.json$/);
    });
    it('all args specified except sample', () => {
        process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/'));
        const args  = Commands.validateTriggerArgs({
            _: ['trigger'],
            template: './',
            data: 'data.json',
            state: 'state.json'
        });
        args.template.should.match(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty$/);
        args.data.should.match(/data.json$/);
        args.state.should.match(/state.json$/);
    });
    it('all args specified except data, parent folder', () => {
        process.chdir(path.resolve(__dirname, 'data/'));
        const args  = Commands.validateTriggerArgs({
            _: ['trigger'],
            template: 'latedeliveryandpenalty',
            sample: 'latedeliveryandpenalty/text/sample.md',
            state: 'latedeliveryandpenalty/state.json'
        });
        args.template.should.match(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty$/);
        args.sample.should.match(/latedeliveryandpenalty[/\\]text[/\\]sample.md$/);
        args.state.should.match(/latedeliveryandpenalty[/\\]state.json$/);
    });
    it('all args specified, parent folder, no sample, no data, no state', () => {
        process.chdir(path.resolve(__dirname, 'data/'));
        (() => Commands.validateTriggerArgs({
            _: ['trigger'],
            template: 'latedeliveryandpenalty',
        })).should.throw('A data file was not provided. Try the --sample flag to provide a data file in markdown format or the --data flag to provide a data file in JSON format.');
    });
    it('all args specified, child folder, no sample, no data, no state', () => {
        process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/text'));
        (() => Commands.validateTriggerArgs({
            _: ['trigger'],
            template: '../',
        })).should.throw('A data file was not provided. Try the --sample flag to provide a data file in markdown format or the --data flag to provide a data file in JSON format.');
    });
    it('no flags specified', () => {
        (() => Commands.validateTriggerArgs({
            _: ['trigger', path.resolve(__dirname, 'data/latedeliveryandpenalty/')],
        })).should.throw('A data file was not provided. Try the --sample flag to provide a data file in markdown format or the --data flag to provide a data file in JSON format.');
    });
    it('verbose flag specified', () => {
        process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/'));
        Commands.validateTriggerArgs({
            _: ['trigger'],
            verbose: true
        });
    });
    it('verbose flag specified with sample option', () => {
        process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/'));
        Commands.validateTriggerArgs({
            _: ['trigger'],
            template: './',
            sample: 'text/sample.md',
            state: 'state.json',
            verbose: true
        });
    });
    it('verbose flag specified with data option', () => {
        process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/'));
        Commands.validateTriggerArgs({
            _: ['trigger'],
            template: './',
            data: 'data.json',
            state: 'state.json',
            verbose: true
        });
    });
    it('bad package.json', () => {
        process.chdir(path.resolve(__dirname, 'data/'));
        (() => Commands.validateTriggerArgs({
            _: ['trigger'],
        })).should.throw(' not a valid cicero template. Make sure that package.json exists and that it has a cicero entry.');
    });
    it('bad sample.md', () => {
        process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/'));
        (() => Commands.validateTriggerArgs({
            _: ['trigger'],
            sample: 'text/sample_en.md'
        })).should.throw('A sample file was specified as "text/sample_en.md" but does not exist at this location.');
    });
    it('bad data.json', () => {
        process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/'));
        (() => Commands.validateTriggerArgs({
            _: ['trigger'],
            data: 'data_en.md'
        })).should.throw('A data file was specified as "data_en.md" but does not exist at this location.');
    });
    it('bad requestjson', () => {
        process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/'));
        (() => Commands.validateTriggerArgs({
            _: ['trigger'],
            request: ['request1.json']
        })).should.throw('A request.json file is required. Try the --request flag or create a request.json in your template.');
    });
});

describe('#trigger', () => {
    it('should trigger a clause using a template and sample', async () => {
        const response = await Commands.trigger(template, sample, null, [request], state);
        response.response.$class.should.be.equal('org.accordproject.latedeliveryandpenalty.LateDeliveryAndPenaltyResponse');
        response.response.penalty.should.be.equal(4);
        response.response.buyerMayTerminate.should.be.equal(true);
    });

    it('should trigger a clause using a template and data', async () => {
        const response = await Commands.trigger(template, null, data, [request], state);
        response.response.$class.should.be.equal('org.accordproject.latedeliveryandpenalty.LateDeliveryAndPenaltyResponse');
        response.response.penalty.should.be.equal(4);
        response.response.buyerMayTerminate.should.be.equal(true);
    });

    it('should trigger a clause using a template archive and sample', async () => {
        const response = await Commands.trigger(templateArchive, sample, null, [request], state);
        response.response.$class.should.be.equal('org.accordproject.latedeliveryandpenalty.LateDeliveryAndPenaltyResponse');
        response.response.penalty.should.be.equal(4);
        response.response.buyerMayTerminate.should.be.equal(true);
    });

    it('should trigger a clause using a template archive and data', async () => {
        const response = await Commands.trigger(templateArchive, null, data, [request], state);
        response.response.$class.should.be.equal('org.accordproject.latedeliveryandpenalty.LateDeliveryAndPenaltyResponse');
        response.response.penalty.should.be.equal(4);
        response.response.buyerMayTerminate.should.be.equal(true);
    });

    it('should trigger with default state when state is not found with sample', async () => {
        const response = await Commands.trigger(template, sample, null, [request], stateErr);
        response.response.$class.should.be.equal('org.accordproject.latedeliveryandpenalty.LateDeliveryAndPenaltyResponse');
        response.response.penalty.should.be.equal(4);
        response.response.buyerMayTerminate.should.be.equal(true);
    });

    it('should trigger with default state when state is not found with data', async () => {
        const response = await Commands.trigger(template, null, data, [request], stateErr);
        response.response.$class.should.be.equal('org.accordproject.latedeliveryandpenalty.LateDeliveryAndPenaltyResponse');
        response.response.penalty.should.be.equal(4);
        response.response.buyerMayTerminate.should.be.equal(true);
    });

    it('should trigger with more than one request with sample', async () => {
        const response = await Commands.trigger(template, sample, null, [request,request], state);
        response.response.$class.should.be.equal('org.accordproject.latedeliveryandpenalty.LateDeliveryAndPenaltyResponse');
        response.response.penalty.should.be.equal(4);
        response.response.buyerMayTerminate.should.be.equal(true);
    });

    it('should trigger with more than one request with data', async () => {
        const response = await Commands.trigger(template, null, data, [request,request], state);
        response.response.$class.should.be.equal('org.accordproject.latedeliveryandpenalty.LateDeliveryAndPenaltyResponse');
        response.response.penalty.should.be.equal(4);
        response.response.buyerMayTerminate.should.be.equal(true);
    });

    it('should fail trigger on a bogus request', async () => {
        const response = await Commands.trigger(template, sample, data, [requestErr], state);
        should.equal(response,undefined);
    });

    it('should trigger a clause using a template (with currentTime set)', async () => {
        const response = await Commands.trigger(template, sample, data, [request], state, '2017-12-19T17:38:01Z');
        response.response.$class.should.be.equal('org.accordproject.latedeliveryandpenalty.LateDeliveryAndPenaltyResponse');
        response.response.penalty.should.be.equal(3.1111111111111107);
        response.response.buyerMayTerminate.should.be.equal(false);
    });
});

describe('#trigger-ergo', () => {
    it('should trigger a clause in ergo using a template', async () => {
        const response = await Commands.trigger(template, sample, data, [request], state);
        response.response.$class.should.be.equal('org.accordproject.latedeliveryandpenalty.LateDeliveryAndPenaltyResponse');
        response.response.penalty.should.be.equal(4);
        response.response.buyerMayTerminate.should.be.equal(true);
    });
});

describe('#trigger-javascript', () => {
    it('should trigger a clause in ergo using a template', async () => {
        const response = await Commands.trigger(templateJs, sample, data, [request], state);
        response.response.$class.should.be.equal('org.accordproject.latedeliveryandpenalty.LateDeliveryAndPenaltyResponse');
        response.response.penalty.should.be.equal(4);
        response.response.buyerMayTerminate.should.be.equal(true);
    });
});

describe('#validateInvokeArgs', () => {
    it('no args specified', () => {
        process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/'));
        (() => Commands.validateInvokeArgs({
            _: ['invoke'],
        })).should.throw('No clause name provided. Try the --clauseName flag to provide a clause to be invoked.');
    });
    it('all args specified', () => {
        process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/'));
        const args  = Commands.validateInvokeArgs({
            _: ['invoke'],
            template: './',
            sample: 'text/sample.md',
            data: 'data.json',
            clauseName: 'latedeliveryandpenalty',
            state: 'state.json',
            params: 'params.json'
        });
        args.template.should.match(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty$/);
        args.sample.should.match(/text[/\\]sample.md$/);
        args.state.should.match(/state.json$/);
        args.clauseName.should.match(/latedeliveryandpenalty$/);
        args.params.should.match(/params.json$/);
    });
    it('all args specified using sample only', () => {
        process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/'));
        const args  = Commands.validateInvokeArgs({
            _: ['invoke'],
            template: './',
            sample: 'text/sample.md',
            clauseName: 'latedeliveryandpenalty',
            state: 'state.json',
            params: 'params.json'
        });
        args.template.should.match(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty$/);
        args.sample.should.match(/text[/\\]sample.md$/);
        args.state.should.match(/state.json$/);
        args.clauseName.should.match(/latedeliveryandpenalty$/);
        args.params.should.match(/params.json$/);
    });
    it('all args specified using sample only, no clauseName', () => {
        process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/'));
        (() => Commands.validateInvokeArgs({
            _: ['invoke'],
            template: './',
            sample: 'text/sample.md',
            state: 'state.json',
            params: 'params.json'
        })).should.throw('No clause name provided. Try the --clauseName flag to provide a clause to be invoked.');
    });
    it('all args specified using sample only, no params', () => {
        process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/'));
        const args  = Commands.validateInvokeArgs({
            _: ['invoke'],
            template: './',
            sample: 'text/sample.md',
            state: 'state.json',
            clauseName: 'latedeliveryandpenalty',
        });
        args.template.should.match(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty$/);
        args.sample.should.match(/text[/\\]sample.md$/);
        args.state.should.match(/state.json$/);
        args.clauseName.should.match(/latedeliveryandpenalty$/);
        args.params.should.match(/params.json$/);
    });
    it('all args specified using sample only, bad params', () => {
        process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/'));
        (() => Commands.validateInvokeArgs({
            _: ['invoke'],
            template: './',
            sample: 'text/sample.md',
            clauseName: 'latedeliveryandpenalty',
            state: 'state.json',
            params: 'foobar.json'
        })).should.throw('A params file was specified as "foobar.json" but does not exist at this location.');
    });
    it('all args specified using sample only, no state', () => {
        process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/'));
        const args  = Commands.validateInvokeArgs({
            _: ['invoke'],
            template: './',
            sample: 'text/sample.md',
            clauseName: 'latedeliveryandpenalty',
            params: 'params.json'
        });
        args.template.should.match(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty$/);
        args.sample.should.match(/text[/\\]sample.md$/);
        args.state.should.match(/state.json$/);
        args.clauseName.should.match(/latedeliveryandpenalty$/);
        args.params.should.match(/params.json$/);
    });
    it('all args specified using sample only, bad state', () => {
        process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/'));
        (() => Commands.validateInvokeArgs({
            _: ['invoke'],
            template: './',
            sample: 'text/sample.md',
            clauseName: 'latedeliveryandpenalty',
            state: 'foobar.json',
            params: 'params.json'
        })).should.throw('A state file was specified as "foobar.json" but does not exist at this location.');
    });
    it('all args specified using data only', () => {
        process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/'));
        const args  = Commands.validateInvokeArgs({
            _: ['invoke'],
            template: './',
            clauseName: 'latedeliveryandpenalty',
            data: 'data.json',
            state: 'state.json',
            params: 'params.json'
        });
        args.template.should.match(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty$/);
        args.data.should.match(/data.json$/);
        args.state.should.match(/state.json$/);
        args.clauseName.should.match(/latedeliveryandpenalty$/);
        args.params.should.match(/params.json$/);
    });
    it('all args specified, parent folder, no sample, no state, no params, no clauseName', () => {
        process.chdir(path.resolve(__dirname, 'data/'));
        (() => Commands.validateInvokeArgs({
            _: ['invoke'],
            template: 'latedeliveryandpenalty',
        })).should.throw('A data file was not provided. Try the --sample flag to provide a data file in markdown format or the --data flag to provide a data file in JSON format.');
    });
    it('all args specified, child folder, no sample', () => {
        process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/text'));
        (() => Commands.validateInvokeArgs({
            _: ['invoke'],
            template: '../',
        })).should.throw('A data file was not provided. Try the --sample flag to provide a data file in markdown format or the --data flag to provide a data file in JSON format.');
    });
    it('no flags specified', () => {
        (() => Commands.validateInvokeArgs({
            _: ['invoke', path.resolve(__dirname, 'data/latedeliveryandpenalty/')],
        })).should.throw('A data file was not provided. Try the --sample flag to provide a data file in markdown format or the --data flag to provide a data file in JSON format.');
    });
    it('verbose flag specified with sample option', () => {
        process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/'));
        Commands.validateInvokeArgs({
            _: ['invoke'],
            template: './',
            sample: 'text/sample.md',
            clauseName: 'latedeliveryandpenalty',
            state: 'state.json',
            params: 'params.json',
            verbose: true
        });
    });
    it('verbose flag specified with data option', () => {
        process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/'));
        Commands.validateInvokeArgs({
            _: ['invoke'],
            template: './',
            data: 'data.json',
            clauseName: 'latedeliveryandpenalty',
            state: 'state.json',
            params: 'params.json',
            verbose: true
        });
    });
    it('bad package.json', () => {
        process.chdir(path.resolve(__dirname, 'data/'));
        (() => Commands.validateInvokeArgs({
            _: ['invoke'],
        })).should.throw(' not a valid cicero template. Make sure that package.json exists and that it has a cicero entry.');
    });
    it('bad sample.md', () => {
        process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/'));
        (() => Commands.validateInvokeArgs({
            _: ['invoke'],
            sample: 'text/sample_en.md'
        })).should.throw('A sample file was specified as "text/sample_en.md" but does not exist at this location.');
    });
    it('bad params', () => {
        process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/'));
        (() => Commands.validateInvokeArgs({
            _: ['invoke'],
            sample: 'text/sample.md',
            clauseName: 'latedeliveryandpenalty',
            params: 'params1.json'
        })).should.throw('A params file was specified as "params1.json" but does not exist at this location.');
    });
});

describe('#invoke', () => {
    it('should invoke a clause using a template and sample', async () => {
        const response = await Commands.invoke(template, sample, null, 'latedeliveryandpenalty', params, state);
        response.response.$class.should.be.equal('org.accordproject.latedeliveryandpenalty.LateDeliveryAndPenaltyResponse');
        response.response.penalty.should.be.equal(4);
        response.response.buyerMayTerminate.should.be.equal(true);
    });

    it('should invoke a clause using a template and data', async () => {
        const response = await Commands.invoke(template, null, data, 'latedeliveryandpenalty', params, state);
        response.response.$class.should.be.equal('org.accordproject.latedeliveryandpenalty.LateDeliveryAndPenaltyResponse');
        response.response.penalty.should.be.equal(4);
        response.response.buyerMayTerminate.should.be.equal(true);
    });

    it('should invoke a clause using a template archive and sample', async () => {
        const response = await Commands.invoke(templateArchive, sample, null, 'latedeliveryandpenalty', params, state);
        response.response.$class.should.be.equal('org.accordproject.latedeliveryandpenalty.LateDeliveryAndPenaltyResponse');
        response.response.penalty.should.be.equal(4);
        response.response.buyerMayTerminate.should.be.equal(true);
    });

    it('should invoke a clause using a template archive and data', async () => {
        const response = await Commands.invoke(templateArchive, null, data, 'latedeliveryandpenalty', params, state);
        response.response.$class.should.be.equal('org.accordproject.latedeliveryandpenalty.LateDeliveryAndPenaltyResponse');
        response.response.penalty.should.be.equal(4);
        response.response.buyerMayTerminate.should.be.equal(true);
    });

    it('should invoke with default state when state is not found with sample', async () => {
        const response = await Commands.invoke(template, sample, null, 'latedeliveryandpenalty', params, stateErr);
        response.response.$class.should.be.equal('org.accordproject.latedeliveryandpenalty.LateDeliveryAndPenaltyResponse');
        response.response.penalty.should.be.equal(4);
        response.response.buyerMayTerminate.should.be.equal(true);
    });

    it('should invoke with default state when state is not found with data', async () => {
        const response = await Commands.invoke(template, null, data, 'latedeliveryandpenalty', params, stateErr);
        response.response.$class.should.be.equal('org.accordproject.latedeliveryandpenalty.LateDeliveryAndPenaltyResponse');
        response.response.penalty.should.be.equal(4);
        response.response.buyerMayTerminate.should.be.equal(true);
    });

    it('should get null response when params not found', async () => {
        const response = await Commands.invoke(template, sample, data, 'latedeliveryandpenalty', paramsErr, state);
        should.equal(response,undefined);
    });

    it('should fail invoke on a bogus request', async () => {
        const response = await Commands.invoke(template, sample, data, paramsErr, state);
        should.equal(response,undefined);
    });

    it('should invoke a clause using a template (with currentTime set)', async () => {
        const response = await Commands.invoke(template, sample, data,'latedeliveryandpenalty', params, state, '2017-12-19T17:38:01Z');
        response.response.$class.should.be.equal('org.accordproject.latedeliveryandpenalty.LateDeliveryAndPenaltyResponse');
        response.response.penalty.should.be.equal(3.1111111111111107);
        response.response.buyerMayTerminate.should.be.equal(false);
    });
});

describe('#validateInitializeArgs', () => {
    it('no args specified', () => {
        process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/'));
        const args  = Commands.validateInitializeArgs({
            _: ['initialize'],
        });
        args.template.should.match(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty$/);
        args.sample.should.match(/text[/\\]sample.md$/);
    });
    it('all args specified', () => {
        process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/'));
        const args  = Commands.validateInitializeArgs({
            _: ['initialize'],
            template: './',
            sample: 'text/sample.md'
        });
        args.template.should.match(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty$/);
        args.sample.should.match(/text[/\\]sample.md$/);
    });
    it('all args specified, parent folder', () => {
        process.chdir(path.resolve(__dirname, 'data/'));
        const args  = Commands.validateInitializeArgs({
            _: ['initt'],
            template: 'latedeliveryandpenalty',
            sample: 'latedeliveryandpenalty/text/sample.md'
        });
        args.template.should.match(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty$/);
        args.sample.should.match(/text[/\\]sample.md$/);
    });
    it('all args specified, parent folder, no sample, no state', () => {
        process.chdir(path.resolve(__dirname, 'data/'));
        (() => Commands.validateInitializeArgs({
            _: ['initialize'],
            template: 'latedeliveryandpenalty',
        })).should.throw('A data file was not provided. Try the --sample flag to provide a data file in markdown format or the --data flag to provide a data file in JSON format.');

    });
    it('all args specified, child folder, no sample', () => {
        process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/text'));
        (() => Commands.validateInitializeArgs({
            _: ['initialize'],
            template: '../',
        })).should.throw('A data file was not provided. Try the --sample flag to provide a data file in markdown format or the --data flag to provide a data file in JSON format.');
    });
    it('no flags specified', () => {
        (() => Commands.validateInitializeArgs({
            _: ['initialize', path.resolve(__dirname, 'data/latedeliveryandpenalty/')],
        })).should.throw('A data file was not provided. Try the --sample flag to provide a data file in markdown format or the --data flag to provide a data file in JSON format.');
    });
    it('verbose flag specified', () => {
        process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/'));
        Commands.validateInitializeArgs({
            _: ['initialize'],
            verbose: true
        });
    });
    it('verbose flag specified with sample option', () => {
        process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/'));
        Commands.validateInitializeArgs({
            _: ['invoke'],
            template: './',
            sample: 'text/sample.md',
            verbose: true
        });
    });
    it('verbose flag specified with data option', () => {
        process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/'));
        Commands.validateInitializeArgs({
            _: ['invoke'],
            template: './',
            data: 'data.json',
            verbose: true
        });
    });
    it('bad package.json', () => {
        process.chdir(path.resolve(__dirname, 'data/'));
        (() => Commands.validateInitializeArgs({
            _: ['initialize'],
        })).should.throw(' not a valid cicero template. Make sure that package.json exists and that it has a cicero entry.');
    });
    it('bad sample.md', () => {
        process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/'));
        (() => Commands.validateInitializeArgs({
            _: ['initialize'],
            sample: 'text/sample_en.md'
        })).should.throw('A sample file was specified as "text/sample_en.md" but does not exist at this location.');
    });
});

describe('#initialize', () => {
    it('should initialize a clause using a template with sample', async () => {
        const response = await Commands.initialize(template, sample);
        response.state.$class.should.be.equal('org.accordproject.runtime.State');
    });

    it('should initialize a clause using a template with sample and params', async () => {
        const response = await Commands.initialize(template, sample, null, params);
        response.state.$class.should.be.equal('org.accordproject.runtime.State');
        response.params.request.$class.should.be.equal('org.accordproject.latedeliveryandpenalty.LateDeliveryAndPenaltyRequest');
    });

    it('should initialize a clause using a template archive with sample', async () => {
        const response = await Commands.initialize(templateArchive, sample);
        response.state.$class.should.be.equal('org.accordproject.runtime.State');
    });
    it('should initialize a clause using a template archive with sample and params', async () => {
        const response = await Commands.initialize(templateArchive, sample, null, params);
        response.state.$class.should.be.equal('org.accordproject.runtime.State');
        response.params.request.$class.should.be.equal('org.accordproject.latedeliveryandpenalty.LateDeliveryAndPenaltyRequest');
    });
    it('should initialize a clause using a template with data', async () => {
        const response = await Commands.initialize(template, null, data);
        response.state.$class.should.be.equal('org.accordproject.runtime.State');
    });
    it('should initialize a clause using a template with data and params', async () => {
        const response = await Commands.initialize(template, null, data, params);
        response.state.$class.should.be.equal('org.accordproject.runtime.State');
        response.params.request.$class.should.be.equal('org.accordproject.latedeliveryandpenalty.LateDeliveryAndPenaltyRequest');
    });
    it('should initialize a clause using a template archive with data', async () => {
        const response = await Commands.initialize(templateArchive, null, data);
        response.state.$class.should.be.equal('org.accordproject.runtime.State');
    });
    it('should initialize a clause using a template archive with data and params', async () => {
        const response = await Commands.initialize(templateArchive, null, data, params);
        response.state.$class.should.be.equal('org.accordproject.runtime.State');
        response.params.request.$class.should.be.equal('org.accordproject.latedeliveryandpenalty.LateDeliveryAndPenaltyRequest');
    });
    it('should fail to initialize on a bogus sample', async () => {
        const response = await Commands.initialize(template, sampleErr);
        should.equal(response,undefined);
    });
});

describe('#validateCompileArgs', () => {
    it('no args specified', () => {
        process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/'));
        const args  = Commands.validateCompileArgs({
            _: ['compile'],
        });
        args.template.should.match(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty$/);
    });
    it('all args specified', () => {
        process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/'));
        const args  = Commands.validateCompileArgs({
            _: ['compile'],
            template: './',
            target: 'Go',
        });
        args.template.should.match(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty$/);
        args.target.should.match(/Go$/);
    });
    it('all args specified, parent folder', () => {
        process.chdir(path.resolve(__dirname, 'data/'));
        const args  = Commands.validateCompileArgs({
            _: ['compile'],
            template: 'latedeliveryandpenalty',
        });
        args.template.should.match(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty$/);
    });
    it('verbose flag specified', () => {
        process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/'));
        Commands.validateCompileArgs({
            _: ['compile'],
            verbose: true
        });
    });
    it('bad package.json', () => {
        process.chdir(path.resolve(__dirname, 'data/'));
        (() => Commands.validateCompileArgs({
            _: ['compile'],
        })).should.throw(' not a valid cicero template. Make sure that package.json exists and that it has a cicero entry.');
    });
});

describe('#compile', () => {

    it('should compile to a Go model', async () => {
        const dir = await tmp.dir({ unsafeCleanup: true });
        await Commands.compile(template, 'Go', dir.path, true);
        fs.readdirSync(dir.path).length.should.be.above(0);
        dir.cleanup();
    });
    it('should compile to a PlantUML model', async () => {
        const dir = await tmp.dir({ unsafeCleanup: true });
        await Commands.compile(template, 'PlantUML', dir.path, true);
        fs.readdirSync(dir.path).length.should.be.above(0);
        dir.cleanup();
    });
    it('should compile to a Typescript model', async () => {
        const dir = await tmp.dir({ unsafeCleanup: true });
        await Commands.compile(template, 'Typescript', dir.path, true);
        fs.readdirSync(dir.path).length.should.be.above(0);
        dir.cleanup();
    });
    it('should compile to a Java model', async () => {
        const dir = await tmp.dir({ unsafeCleanup: true });
        await Commands.compile(template, 'Java', dir.path, true);
        fs.readdirSync(dir.path).length.should.be.above(0);
        dir.cleanup();
    });
    it('should compile to a Corda model', async () => {
        const dir = await tmp.dir({ unsafeCleanup: true });
        await Commands.compile(template, 'Corda', dir.path, true);
        fs.readdirSync(dir.path).length.should.be.above(0);
        dir.cleanup();
    });
    it('should compile to a JSONSchema model', async () => {
        const dir = await tmp.dir({ unsafeCleanup: true });
        await Commands.compile(template, 'JSONSchema', dir.path, true);
        fs.readdirSync(dir.path).length.should.be.above(0);
        dir.cleanup();
    });
    it('should not compile to an unknown model', async () => {
        const dir = await tmp.dir({ unsafeCleanup: true });
        await Commands.compile(template, 'BLAH', dir.path, true);
        fs.readdirSync(dir.path).length.should.be.equal(0);
        dir.cleanup();
    });
});

describe('#validateArchiveArgs', () => {
    it('no args specified', () => {
        process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/'));
        const args  = Commands.validateArchiveArgs({
            _: ['archive']
        });
        args.template.should.match(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty$/);
        args.target.should.match(/ergo/);
    });
    it('only target arg specified', () => {
        process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/'));
        const args  = Commands.validateArchiveArgs({
            _: ['archive'],
            target: 'ergo'
        });
        args.template.should.match(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty$/);
        args.target.should.match(/ergo/);
    });
    it('template arg specified', () => {
        process.chdir(path.resolve(__dirname));
        const args  = Commands.validateArchiveArgs({
            _: ['archive', 'data/latedeliveryandpenalty/']
        });
        args.template.should.match(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty$/);
        args.target.should.match(/ergo/);
    });
    it('verbose flag specified', () => {
        process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/'));
        Commands.validateArchiveArgs({
            _: ['archive'],
            verbose: true
        });
    });
    it('bad package.json', () => {
        process.chdir(path.resolve(__dirname, 'data/'));
        (() => Commands.validateArchiveArgs({
            _: ['archive']
        })).should.throw(' not a valid cicero template. Make sure that package.json exists and that it has a cicero entry.');
    });
});

describe('#archive', async () => {
    it('should create signed archive', async () => {
        const archiveName = 'test.cta';
        const p12path = path.resolve(__dirname, 'data/keystore.p12');
        const keystore = {
            path: p12path,
            passphrase: 'password'
        };
        const options = {
            keystore: keystore
        };
        const result = await Commands.archive(template, 'ergo', archiveName, options);
        result.should.eql(true);
        const newTemplate = await Template.fromArchive(fs.readFileSync(archiveName));
        newTemplate.should.not.be.null;
        newTemplate.should.have.own.property('authorSignature');
        fs.unlinkSync(archiveName);
    });

    it('should create a valid ergo archive', async () => {
        const archiveName = 'test.cta';
        const options = {};
        const result = await Commands.archive(template, 'ergo', archiveName, options);
        result.should.eql(true);
        const newTemplate = await Template.fromArchive(fs.readFileSync(archiveName));
        newTemplate.should.not.be.null;
        newTemplate.hasLogic().should.equal(true);
        fs.unlinkSync(archiveName);
    });

    it('should create a valid ergo archive with a default name', async () => {
        const archiveName = 'latedeliveryandpenalty@0.0.1.cta';
        const options = {};
        const result = await Commands.archive(template, 'ergo', null, options);
        result.should.eql(true);
        const newTemplate = await Template.fromArchive(fs.readFileSync(archiveName));
        newTemplate.should.not.be.null;
        newTemplate.hasLogic().should.equal(true);
        fs.unlinkSync(archiveName);
    });

    it('should create an Ergo archive', async () => {
        const tmpFile = await tmp.file();
        const tmpArchive = tmpFile.path + '.cta';
        const options = {};
        await Commands.archive(template, 'ergo', tmpArchive, options);
        fs.readFileSync(tmpArchive).length.should.be.above(0);
        tmpFile.cleanup();
    });
    it('should create a JavaScript archive', async () => {
        const tmpFile = await tmp.file();
        const tmpArchive = tmpFile.path + '.cta';
        const options = {};
        await Commands.archive(template, 'es6', tmpArchive, options);
        fs.readFileSync(tmpArchive).length.should.be.above(0);
        tmpFile.cleanup();
    });
    it('should not create an unknown archive', async () => {
        const tmpFile = await tmp.file();
        const tmpArchive = tmpFile.path + '.cta';
        const options = {};
        return Commands.archive(template, 'foo', tmpArchive, options)
            .should.be.rejectedWith('Unknown target: foo (available: es6,java)');
    });

});

describe('#validateGetArgs', () => {
    it('no args specified', () => {
        process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/'));
        const args  = Commands.validateGetArgs({
            _: ['get']
        });
        args.template.should.match(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty$/);
        args.output.should.match(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty[/\\]model$/);
    });
    it('only output arg specified', () => {
        process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/'));
        const args  = Commands.validateGetArgs({
            _: ['get'],
            output: 'foo'
        });
        args.template.should.match(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty$/);
        args.output.should.match(/foo/);
    });
    it('template directory specified', () => {
        process.chdir(path.resolve(__dirname));
        const args  = Commands.validateGetArgs({
            _: ['get', 'data/latedeliveryandpenalty/']
        });
        args.template.should.match(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty$/);
        args.output.should.match(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty[/\\]model$/);
    });
    it('template archive specified', () => {
        process.chdir(path.resolve(__dirname));
        const args  = Commands.validateGetArgs({
            _: ['get', templateArchive]
        });
        args.template.should.eql(templateArchive);
        args.output.should.match(/model$/);
    });
    it('verbose flag specified', () => {
        process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/'));
        Commands.validateGetArgs({
            _: ['get'],
            verbose: true
        });
    });
    it('bad package.json', () => {
        process.chdir(path.resolve(__dirname, 'data/'));
        (() => Commands.validateGetArgs({
            _: ['get']
        })).should.throw(' not a valid cicero template. Make sure that package.json exists and that it has a cicero entry.');
    });
});

describe('#get', async () => {
    it('should get dependencies for a template', async () => {
        const dir = await tmp.dir({ unsafeCleanup: true });
        await Commands.get(template, dir.path);
        fs.readdirSync(dir.path).length.should.be.above(0);
        dir.cleanup();
    });
});

describe('#validateVerfiyArgs', () => {
    it('no args specified', () => {
        process.chdir(path.resolve(__dirname, 'data/signedArchive/'));
        const args  = Commands.validateVerifyArgs({
            _: ['verify']
        });
        args.template.should.match(/cicero-cli[/\\]test[/\\]data[/\\]signedArchive$/);
    });
    it('template arg specified', () => {
        process.chdir(path.resolve(__dirname));
        const args  = Commands.validateVerifyArgs({
            _: ['verify', 'data/signedArchive/']
        });
        args.template.should.match(/cicero-cli[/\\]test[/\\]data[/\\]signedArchive$/);
    });
    it('verbose flag specified', () => {
        process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/'));
        Commands.validateVerifyArgs({
            _: ['verify'],
            verbose: true
        });
    });
    it('bad package.json', () => {
        process.chdir(path.resolve(__dirname, 'data/'));
        (() => Commands.validateVerifyArgs({
            _: ['verify']
        })).should.throw(' not a valid cicero template. Make sure that package.json exists and that it has a cicero entry.');
    });
});

describe('#verify', async () => {
    it('should verify the signature of the template author/developer', async () => {
        const templatePath = path.resolve(__dirname, 'data/signedArchive/');
        return Commands.verify(templatePath).should.be.fulfilled;
    });
    it('should throw error when signture is invalid', async () => {
        const templatePath = path.resolve(__dirname, 'data/signedArchiveFail/');
        return Commands.verify(templatePath).should.be.rejectedWith('Template\'s author signature is invalid!');
    });
});
