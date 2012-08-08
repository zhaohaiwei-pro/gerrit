// Copyright (C) 2008 The Android Open Source Project
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package com.google.gerrit.client.admin;

import com.google.gerrit.client.Dispatcher;
import com.google.gerrit.client.projects.ProjectInfo;
import com.google.gerrit.client.projects.ProjectMap;
import com.google.gerrit.client.rpc.ScreenLoadCallback;
import com.google.gerrit.client.ui.Hyperlink;
import com.google.gerrit.client.ui.ProjectsTable;
import com.google.gerrit.client.ui.Screen;
import com.google.gerrit.common.PageLinks;
import com.google.gwt.user.client.History;

public class ProjectListScreen extends Screen {
  private ProjectsTable projects;

  @Override
  protected void onLoad() {
    super.onLoad();
    ProjectMap.all(new ScreenLoadCallback<ProjectMap>(this) {
      @Override
      protected void preDisplay(final ProjectMap result) {
        projects.display(result);
        projects.finishDisplay();
      }
    });
  }

  @Override
  protected void onInitUI() {
    super.onInitUI();
    setPageTitle(Util.C.projectListTitle());

    projects = new ProjectsTable() {
      @Override
      protected void onOpenRow(final int row) {
        History.newItem(link(getRowItem(row)));
      }

      private String link(final ProjectInfo item) {
        return Dispatcher.toProjectAdmin(item.name_key(), ProjectScreen.INFO);
      }

      @Override
      protected void populate(final int row, final ProjectInfo k) {
        table.setWidget(row, 1, new Hyperlink(k.name(), link(k)));
        table.setText(row, 2, k.description());

        setRowItem(row, k);
      }
    };
    projects.setSavePointerId(PageLinks.ADMIN_PROJECTS);

    add(projects);
  }

  @Override
  public void registerKeys() {
    super.registerKeys();
    projects.setRegisterKeys(true);
  }
}
