﻿<%@ Page Language="C#" MasterPageFile="~/Views/Shared/Site.Master" Inherits="System.Web.Mvc.ViewPage" %>
<asp:Content ContentPlaceHolderID="TitleContent" runat="server">
Wires
</asp:Content>
<asp:Content ContentPlaceHolderID="MainContent" runat="server">
<div class="wires">
<canvas id="com-spartanprogramming-wires" width="960" height="600"></canvas>
</div>
<script type="text/javascript">
    (function () {
        var app = new Framework.Application(document.getElementById("com-spartanprogramming-wires"));
        app.Run();
    })();
</script>
</asp:Content>