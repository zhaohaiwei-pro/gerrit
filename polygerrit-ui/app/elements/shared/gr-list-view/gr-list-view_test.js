/**
 * @license
 * Copyright (C) 2017 The Android Open Source Project
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
import './gr-list-view.js';
import page from 'page/page.mjs';

const basicFixture = fixtureFromElement('gr-list-view');

suite('gr-list-view tests', () => {
  let element;

  setup(() => {
    element = basicFixture.instantiate();
  });

  test('_computeNavLink', () => {
    const offset = 25;
    const projectsPerPage = 25;
    let filter = 'test';
    const path = '/admin/projects';

    sinon.stub(element, 'getBaseUrl').callsFake(() => '');

    assert.equal(
        element._computeNavLink(offset, 1, projectsPerPage, filter, path),
        '/admin/projects/q/filter:test,50');

    assert.equal(
        element._computeNavLink(offset, -1, projectsPerPage, filter, path),
        '/admin/projects/q/filter:test');

    assert.equal(
        element._computeNavLink(offset, 1, projectsPerPage, null, path),
        '/admin/projects,50');

    assert.equal(
        element._computeNavLink(offset, -1, projectsPerPage, null, path),
        '/admin/projects');

    filter = 'plugins/';
    assert.equal(
        element._computeNavLink(offset, 1, projectsPerPage, filter, path),
        '/admin/projects/q/filter:plugins%252F,50');
  });

  test('_onValueChange', done => {
    element.path = '/admin/projects';
    sinon.stub(page, 'show').callsFake( url => {
      assert.equal(url, '/admin/projects/q/filter:test');
      done();
    });
    element.filter = 'test';
  });

  test('_filterChanged not reload when swap between falsy values', () => {
    sinon.stub(element, '_debounceReload');
    element.filter = null;
    element.filter = undefined;
    element.filter = '';
    assert.isFalse(element._debounceReload.called);
  });

  test('next button', done => {
    element.itemsPerPage = 25;
    let projects = new Array(26);

    flush(() => {
      let loading;
      assert.isFalse(element._hideNextArrow(loading, projects));
      loading = true;
      assert.isTrue(element._hideNextArrow(loading, projects));
      loading = false;
      assert.isFalse(element._hideNextArrow(loading, projects));
      element._projects = [];
      assert.isTrue(element._hideNextArrow(loading, element._projects));
      projects = new Array(4);
      assert.isTrue(element._hideNextArrow(loading, projects));
      done();
    });
  });

  test('prev button', () => {
    assert.isTrue(element._hidePrevArrow(true, 0));
    flush(() => {
      let offset = 0;
      assert.isTrue(element._hidePrevArrow(false, offset));
      offset = 5;
      assert.isFalse(element._hidePrevArrow(false, offset));
    });
  });

  test('createNew link appears correctly', () => {
    assert.isFalse(element.shadowRoot
        .querySelector('#createNewContainer').classList
        .contains('show'));
    element.createNew = true;
    flushAsynchronousOperations();
    assert.isTrue(element.shadowRoot
        .querySelector('#createNewContainer').classList
        .contains('show'));
  });

  test('fires create clicked event when button tapped', () => {
    const clickHandler = sinon.stub();
    element.addEventListener('create-clicked', clickHandler);
    element.createNew = true;
    flushAsynchronousOperations();
    MockInteractions.tap(element.shadowRoot.querySelector('#createNew'));
    assert.isTrue(clickHandler.called);
  });

  test('next/prev links change when path changes', () => {
    const BRANCHES_PATH = '/path/to/branches';
    const TAGS_PATH = '/path/to/tags';
    sinon.stub(element, '_computeNavLink');
    element.offset = 0;
    element.itemsPerPage = 25;
    element.filter = '';
    element.path = BRANCHES_PATH;
    assert.equal(element._computeNavLink.lastCall.args[4], BRANCHES_PATH);
    element.path = TAGS_PATH;
    assert.equal(element._computeNavLink.lastCall.args[4], TAGS_PATH);
  });

  test('_computePage', () => {
    assert.equal(element._computePage(0, 25), 1);
    assert.equal(element._computePage(50, 25), 3);
  });
});

