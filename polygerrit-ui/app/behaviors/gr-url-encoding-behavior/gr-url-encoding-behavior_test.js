/**
 * @license
 * Copyright (C) 2018 The Android Open Source Project
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

import '../../test/common-test-setup-karma.js';
import {Polymer} from '@polymer/polymer/lib/legacy/polymer-fn.js';
import {URLEncodingBehavior} from './gr-url-encoding-behavior.js';

const basicFixture =
    fixtureFromElement('gr-url-encoding-behavior-test-element');

suite('gr-url-encoding-behavior tests', () => {
  let element;

  suiteSetup(() => {
    // Define a Polymer element that uses this behavior.
    Polymer({
      is: 'gr-url-encoding-behavior-test-element',
      behaviors: [URLEncodingBehavior],
    });
  });

  setup(() => {
    element = basicFixture.instantiate();
  });

  suite('encodeURL', () => {
    test('double encodes', () => {
      assert.equal(element.encodeURL('abc?123'), 'abc%253F123');
      assert.equal(element.encodeURL('def/ghi'), 'def%252Fghi');
      assert.equal(element.encodeURL('jkl'), 'jkl');
      assert.equal(element.encodeURL(''), '');
    });

    test('does not convert colons', () => {
      assert.equal(element.encodeURL('mno:pqr'), 'mno:pqr');
    });

    test('converts spaces to +', () => {
      assert.equal(element.encodeURL('words with spaces'), 'words+with+spaces');
    });

    test('does not convert slashes when configured', () => {
      assert.equal(element.encodeURL('stu/vwx', true), 'stu/vwx');
    });

    test('does not convert slashes when configured', () => {
      assert.equal(element.encodeURL('stu/vwx', true), 'stu/vwx');
    });
  });

  suite('singleDecodeUrl', () => {
    test('single decodes', () => {
      assert.equal(element.singleDecodeURL('abc%3Fdef'), 'abc?def');
    });

    test('converts + to space', () => {
      assert.equal(element.singleDecodeURL('ghi+jkl'), 'ghi jkl');
    });
  });
});

