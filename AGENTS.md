<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->


Agora devemos implementar uma rota administrativa
* nessa rota, o user poderá acessaar fazendo login com um login de admin
* nessa pagina, o admin podera ver
   *   todos os pedidos
      * com detalhes do pedido, como numero do pedido id
      * detalhe do user que pediu
      * Marcar como pedido pronto/cancelado/enviado dentro desse card
      * pode ver detalhes de forma mais completa desse pedido
      * input para buscar o pedido
      * categorias para buscar se o pedido foi entregue, pendente, preparado, pronto
   *  Aqui o admin tbm podera monitorar os produtos(se for possivel com essa api), como excluir, ativar ou desativar produto, editar 
   * e adicionar um novo produto
   * Essa sessão de produtos, sp se for possivel fazer usando o apimeal, se n der, n precisar fazer nada

   Lembrar que os pedidos q sao atualizados no admin, não aparecem alterados em 'pedidos'