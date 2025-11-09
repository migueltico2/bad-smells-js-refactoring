export class ReportGenerator {
  constructor(database) {
    this.db = database;
  }

  generateReport(reportType, user, items) {
    const header = this.buildHeader(reportType, user);
    const body = this.buildBody(reportType, user, items);
    const footer = this.buildFooter(reportType, body.total);

    return (header + body.content + footer).trim();
  }

  // --- Cabeçalho ---
  buildHeader(reportType, user) {
    if (reportType === 'CSV') {
      return 'ID,NOME,VALOR,USUARIO\n';
    }

    if (reportType === 'HTML') {
      return `
<html><body>
<h1>Relatório</h1>
<h2>Usuário: ${user.name}</h2>
<table>
<tr><th>ID</th><th>Nome</th><th>Valor</th></tr>
`;
    }

    return '';
  }

  // --- Corpo (antes era a parte mais complexa) ---
  buildBody(reportType, user, items) {
    let content = '';
    let total = 0;

    for (const item of items) {
      const shouldInclude =
        user.role === 'ADMIN' || (user.role === 'USER' && item.value <= 500);

      if (!shouldInclude) continue;

      if (user.role === 'ADMIN' && item.value > 1000) {
        item.priority = true;
      }

      content += this.renderItem(reportType, item, user);
      total += item.value;
    }

    return { content, total };
  }

  // --- Renderiza cada linha ---
  renderItem(reportType, item, user) {
    if (reportType === 'CSV') {
      return `${item.id},${item.name},${item.value},${user.name}\n`;
    }

    if (reportType === 'HTML') {
      const style = item.priority ? ' style="font-weight:bold;"' : '';
      return `<tr${style}><td>${item.id}</td><td>${item.name}</td><td>${item.value}</td></tr>\n`;
    }

    return '';
  }

  // --- Rodapé ---
  buildFooter(reportType, total) {
    if (reportType === 'CSV') {
      return `\nTotal,,\n${total},,\n`;
    }

    if (reportType === 'HTML') {
      return `</table>
<h3>Total: ${total}</h3>
</body></html>\n`;
    }

    return '';
  }
}
