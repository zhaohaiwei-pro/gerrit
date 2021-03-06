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
import {
  BaseUrlBehavior,
  BaseUrlBehaviorInterface,
} from '../base-url-behavior/base-url-behavior';

const PROBE_PATH = '/Documentation/index.html';
const DOCS_BASE_PATH = '/Documentation';

let cachedPromise: Promise<string | null> | undefined;

// NOTE: Below we define 2 types (DocUrlBehaviorConfig and RestApi) to avoid
// type 'any'. These are temporary definitions and they must be
// updated/moved/removed when we start converting our codebase to typescript.
// Right now we are using these types here just for adding typescript support to
// our build/test infrastructure. Doing so we avoid massive code updates at this
// stage.

// TODO: introduce global gerrit config type instead of DocUrlBehaviorConfig.
// The DocUrlBehaviorConfig is a temporary type
interface DocUrlBehaviorConfig {
  gerrit?: {doc_url?: string};
}

// TODO: implement RestApi type correctly and remove interface from this file
interface RestApi {
  probePath(url: string): Promise<boolean>;
}

/** @polymerBehavior DocsUrlBehavior */
export const DocsUrlBehavior = [
  {
    /**
     * Get the docs base URL from either the server config or by probing.
     *
     * @param {Object} config The server config.
     * @param {!Object} restApi A REST API instance
     * @return {!Promise<string>} A promise that resolves with the docs base
     *     URL.
     */
    getDocsBaseUrl(
      this: BaseUrlBehaviorInterface,
      config: DocUrlBehaviorConfig,
      restApi: RestApi
    ) {
      if (!cachedPromise) {
        cachedPromise = new Promise(resolve => {
          if (config && config.gerrit && config.gerrit.doc_url) {
            resolve(config.gerrit.doc_url);
          } else {
            restApi.probePath(this.getBaseUrl() + PROBE_PATH).then(ok => {
              resolve(ok ? this.getBaseUrl() + DOCS_BASE_PATH : null);
            });
          }
        });
      }
      return cachedPromise;
    },

    /** For testing only. */
    _clearDocsBaseUrlCache() {
      cachedPromise = undefined;
    },
  },
  BaseUrlBehavior,
];

// TODO(dmfilippov) Remove the following lines with assignments
// Plugins can use the behavior because it was accessible with
// the global Gerrit... variable. To avoid breaking changes in plugins
// temporary assign global variables.
window.Gerrit = window.Gerrit || {};
window.Gerrit.DocsUrlBehavior = DocsUrlBehavior;
