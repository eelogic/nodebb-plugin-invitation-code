<div class="row">
  <div class="col-lg-12">
    <div class="panel panel-default">
      <div class="panel-heading"><i class="fa fa-user"></i> Invitation Codes</div>
        <div class="panel-body">
          <div class="panel-toolbar">
            <button class="btn btn-primary" id="refresh-invitation-code">
              <i class="fa fa-refresh"></i>
            </button>
            <button class="btn btn-primary" id="add-invitation-code">
              <i class="fa fa-plus"></i>&nbsp;Add Invitation Codes
            </button>
            <button class="btn btn-primary" id="dispatch-invitation-code">
              <i class="fa fa-share"></i>&nbsp;Dispatch Invitation Codes
            </button>
            <button class="btn btn-forbidden" id="del-invitation-code">
              <i class="fa fa-trash"></i>&nbsp;Delete Invitation Codes
            </button>
            <div id="invitation-code-pagination">
              Total:&nbsp;<span class="total-num"></span>,&nbsp;&nbsp;
              Pages:&nbsp;<span class="cur-page"></span>&nbsp;/&nbsp;
              <span class="total-page"></span>&nbsp;&nbsp;
              <button class="btn btn-prev"><i class="fa fa-angle-left"></i></button>
              <button class="btn btn-next"><i class="fa fa-angle-right"></i></button>
            </div>
          </div>
          <div id="invitation-code-table" class="table-wrapper">
            <table class="table table-bordered table-hover">
              <thead>
                <tr>
                  <th width="40"><input type="checkbox" /></th>
                  <th width="300">Invitation Code</th>
                  <th width="100">Dispatched</th>
                  <th>Email</th>
                </tr>
              </thead>
              <tbody>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
	</div>
</div>

<style>
  @import url("../../plugins/nodebb-plugin-invitation-code/static/templates/admin/style.css");
</style>

<script src="../../plugins/nodebb-plugin-invitation-code/static/templates/admin/script.js"></script>
