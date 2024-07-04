import React from 'react';

const posts = [
  {
    id: 1,
    title: 'Avisos e Alertas',
    href: 'https://defesacivil.rs.gov.br/avisos-e-alertas',
    description: 'A Defesa Civil emite avisos e alertas que podem ou não se confirmar.',
    imageUrl: 'https://media.glamourmagazine.co.uk/photos/642eee289a306cef824deda0/4:3/w_1704,h_1278,c_limit/ALERT-SUNDAY-060423-PHONE-GettyImages-1385795610_L.jpg',
    date: 'Jun 1, 2024',
    datetime: '2024-06-01',
    category: { title: 'Segurança', href: '#' },
    
  },
  {
    id: 2,
    title: 'Como pedir socorro',
    href: 'https://sosenchentes.rs.gov.br/como-pedir-socorro',
    description: 'Orientações e contatos das forças de resgate. Salve os números de emergência.',
    imageUrl: 'https://www.tupi.fm/wp-content/uploads/2024/05/WhatsApp-Image-2024-05-04-at-06.56.12-1024x577.jpeg',
    date: 'Jun 5, 2024',
    datetime: '2024-06-05',
    category: { title: 'Emergência', href: '#' },
    
  },
  {
    id: 3,
    title: 'Cuidados com a Saúde',
    href: 'https://sosenchentes.rs.gov.br/cuidados-com-a-saude',
    description: 'Guia sobre os riscos e cuidados em situação de enchentes.',
    imageUrl: 'https://media.gazetadopovo.com.br/2024/01/17120151/vacina-covid-criancas-960x540.jpg',
    date: 'Mar 10, 2024',
    datetime: '2024-06-10',
    category: { title: 'Saúde', href: '#' },
    
  },
  {
    id: 4,
    title: 'Encontre um abrigo',
    href: 'https://sosenchentes.rs.gov.br/abrigos',
    description: 'Locais para acolher quem precisa de abrigo. Acesse para ver mais.',
    imageUrl: 'https://www.diariodepernambuco.com.br/dpimages/k5jhtz-7y_ccsjJbpbh_Jo8Exlg=/960x0/smart/imgsapp.diariodepernambuco.com.br/app/noticia_127983242361/2024/05/10/952435/20240510204440303102a.jpeg',
    date: 'Mar 15, 2024',
    datetime: '2024-06-15',
    category: { title: 'Abrigo', href: '#' },
    
  },
  {
    id: 5,
    title: 'Como ajudar um abrigo',
    href: 'https://sosenchentes.rs.gov.br/como-ajudar-um-abrigo',
    description: 'Acesse a plataforma Solidariedade RS para conferir necessidades de abrigos.',
    imageUrl: 'https://cdn.prod.website-files.com/60ff690cd7b0537edb99a29a/663ec341e6c901fa0884011d_Design%20sem%20nome%20(18).jpg',
    date: 'Mar 20, 2024',
    datetime: '2024-06-20',
    category: { title: 'Solidariedade', href: '#' },
    
  },
  {
    id: 6,
    title: 'Notícias',
    href: 'https://estado.rs.gov.br/inicial',
    description: 'Portal de notícias do governo do Rio Grande do Sul.',
    imageUrl: 'https://estado.rs.gov.br/upload/recortes/202406/05191646_2136994_GD.jpg',
    date: 'Mar 25, 2024',
    datetime: '2024-06-25',
    category: { title: 'Notícias', href: '#' },
    
  },
];

export default function MyPanel() {
  return (
    <div className="bg-white py-6 sm:py-2">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Informações Importantes</h2>
          <p className="mt-2 text-lg leading-8 text-gray-600">
            Confira algumas informações essenciais para sua segurança e bem-estar.
          </p>
        </div>
        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {posts.map((post) => (
            <article key={post.id} className="flex flex-col items-start justify-between">
              <div className="relative w-full h-48">
                <img
                    src={post.imageUrl}
                    alt=""
                    className="w-full h-full rounded-2xl object-cover"
                />
                <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-gray-900/10" />
            </div>
              <div className="max-w-xl">
                <div className="mt-8 flex items-center gap-x-4 text-xs">
                  <time dateTime={post.datetime} className="text-gray-500">
                    {post.date}
                  </time>
                  <a
                    href={post.category.href}
                    className="relative z-10 rounded-full bg-gray-50 px-3 py-1.5 font-medium text-gray-600 hover:bg-gray-100"
                  >
                    {post.category.title}
                  </a>
                </div>
                <div className="group relative">
                  <h3 className="mt-3 text-lg font-semibold leading-6 text-gray-900 group-hover:text-gray-600">
                    <a href={post.href}>
                      <span className="absolute inset-0" />
                      {post.title}
                    </a>
                  </h3>
                  <p className="mt-5 line-clamp-3 text-sm leading-6 text-gray-600">{post.description}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
