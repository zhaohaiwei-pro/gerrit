/**
 * @license
 * Copyright (C) 2016 The Android Open Source Project
 *
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

import '../../../test/common-test-setup-karma.js';
import './gr-comment-list.js';
import {dom} from '@polymer/polymer/lib/legacy/polymer.dom.js';
import {GerritNav} from '../../core/gr-navigation/gr-navigation.js';

const basicFixture = fixtureFromElement('gr-comment-list');

suite('gr-comment-list tests', () => {
  let element;

  setup(() => {
    element = basicFixture.instantiate();

    sinon.stub(GerritNav, 'mapCommentlinks').callsFake( x => x);
  });

  test('_computeFilesFromComments w/ special file path sorting', () => {
    const comments = {
      'file_b.html': [],
      'file_c.css': [],
      'file_a.js': [],
      'test.cc': [],
      'test.h': [],
    };
    const expected = [
      'file_a.js',
      'file_b.html',
      'file_c.css',
      'test.h',
      'test.cc',
    ];
    const actual = element._computeFilesFromComments(comments);
    assert.deepEqual(actual, expected);

    assert.deepEqual(element._computeFilesFromComments(null), []);
  });

  test('_computePatchDisplayName', () => {
    const comment = {line: 123, side: 'REVISION', patch_set: 10};

    element.patchNum = 10;
    assert.equal(element._computePatchDisplayName(comment), '');

    element.patchNum = 9;
    assert.equal(element._computePatchDisplayName(comment), 'PS10, ');

    comment.side = 'PARENT';
    assert.equal(element._computePatchDisplayName(comment), 'Base, ');
  });

  test('config commentlinks propagate to formatted text', () => {
    element.comments = {
      'test.h': [{
        author: {name: 'foo'},
        patch_set: 4,
        line: 10,
        updated: '2017-10-30 20:48:40.000000000',
        message: 'Ideadbeefdeadbeef',
        unresolved: true,
      }],
    };
    element.projectConfig = {
      commentlinks: {foo: {link: '#/q/$1', match: '(I[0-9a-f]{8,40})'}},
    };
    flushAsynchronousOperations();
    const formattedText = dom(element.root).querySelector(
        'gr-formatted-text.message');
    assert.isOk(formattedText.config);
    assert.deepEqual(formattedText.config,
        element.projectConfig.commentlinks);
  });

  test('_computeDiffLineURL', () => {
    const getUrlStub = sinon.stub(GerritNav, 'getUrlForDiffById');
    element.projectName = 'proj';
    element.changeNum = 123;

    const comment = {line: 456};
    element._computeDiffLineURL('foo.cc', 123, 4, comment);
    assert.isTrue(getUrlStub.calledOnce);
    assert.deepEqual(getUrlStub.lastCall.args,
        [123, 'proj', 'foo.cc', 4, null, 456, false]);

    comment.side = 'PARENT';
    element._computeDiffLineURL('foo.cc', 123, 4, comment);
    assert.isTrue(getUrlStub.calledTwice);
    assert.deepEqual(getUrlStub.lastCall.args,
        [123, 'proj', 'foo.cc', 4, null, 456, true]);

    comment.parent = 12;
    element._computeDiffLineURL('foo.cc', 123, 4, comment);
    assert.isTrue(getUrlStub.calledThrice);
    assert.deepEqual(getUrlStub.lastCall.args,
        [123, 'proj', 'foo.cc', 4, -12, 456, true]);
  });
});

