<%@ Page Language="C#" MasterPageFile="~/Views/Shared/Site.Master" Inherits="System.Web.Mvc.ViewPage" %>
<asp:Content ContentPlaceHolderID="TitleContent" runat="server">
Wires
</asp:Content>
<asp:Content ContentPlaceHolderID="MainContent" runat="server">
<div class="wires">
<canvas id="com-spartanprogramming-wires" width="960" height="600"></canvas>
</div>
<script type="text/javascript">
    (function () {
        application.run("com-spartanprogramming-wires");
    })();
</script>
</asp:Content>