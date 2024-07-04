import Header from '@/components/Header';
import { CheckCircleIcon, InformationCircleIcon } from '@heroicons/react/20/solid';
import button from '@/images/button.jpeg'
import form from '@/images/form.png'
import itens from '@/images/itens.png'
import thanks from '@/images/thanks.jpeg'
import Image from 'next/image';

export default function ComoAjudar() {
  return (
    <>
    <Header />
    <div className="bg-white px-6 py-16 lg:px-8">
      <div className="mx-auto max-w-3xl text-base leading-7 text-gray-700">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Como Anunciar uma Doação</h1>
        <p className="mt-6 text-xl leading-8">
          Anunciar uma doação no nosso site é simples e rápido. Siga os passos abaixo para ajudar alguém necessitado:
        </p>
        
        <div className="mt-10 max-w-2xl">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Passo 1: Faça login</h2>
          <p className="mt-6">
            Primeiro, faça login na sua conta e navegue até a página de anúncio de doações. Clique no botão "Anuncie Mantimentos" no menu principal.
          </p>
          <figure className="mt-10 border-l border-red-600 pl-9">
            <blockquote className="font-semibold text-gray-900">
              <p>
                “Se você ainda não possui uma conta, clique em "Registrar" e preencha os dados necessários para criar uma nova conta.”
              </p>
            </blockquote>
          </figure>
          
          <h2 className="mt-16 text-2xl font-bold tracking-tight text-gray-900">Passo 2: Preencha as Informações da Doação</h2>
          <p className="mt-6">
            Preencha o formulário com as informações da doação.
          </p>

          <ul role="list" className="mt-8 max-w-xl space-y-8 text-gray-600">
            <li className="flex gap-x-3">
              <CheckCircleIcon className="mt-1 h-5 w-5 flex-none text-red-600" aria-hidden="true" />
              <span>
                <strong className="font-semibold text-gray-900">Categoria.</strong> Selecione a categoria do item que você deseja doar.
              </span>
            </li>
            <li className="flex gap-x-3">
              <CheckCircleIcon className="mt-1 h-5 w-5 flex-none text-red-600" aria-hidden="true" />
              <span>
                <strong className="font-semibold text-gray-900">Quantidade.</strong> Informe a quantidade de itens que está doando.
              </span>
            </li>
            <li className="flex gap-x-3">
              <CheckCircleIcon className="mt-1 h-5 w-5 flex-none text-red-600" aria-hidden="true" />
              <span>
                <strong className="font-semibold text-gray-900">Apresentação.</strong> Descreva como os itens estão embalados ou apresentados.
              </span>
            </li>
            <li className="flex gap-x-3">
              <CheckCircleIcon className="mt-1 h-5 w-5 flex-none text-red-600" aria-hidden="true" />
              <span>
                <strong className="font-semibold text-gray-900">Lote e Data de Validade.</strong> Se o item for um alimento, item de higiene ou medicamento, informe o lote e a data de validade.
              </span>
            </li>
            <li className="flex gap-x-3">
              <CheckCircleIcon className="mt-1 h-5 w-5 flex-none text-red-600" aria-hidden="true" />
              <span>
                <strong className="font-semibold text-gray-900">Tamanhos.</strong> Para roupas, calçados e fraldas, selecione o tamanho apropriado.
              </span>
            </li>
            <li className="flex gap-x-3">
              <CheckCircleIcon className="mt-1 h-5 w-5 flex-none text-red-600" aria-hidden="true" />
              <span>
                <strong className="font-semibold text-gray-900">Título e Descrição.</strong> Dê um título à sua doação e forneça uma descrição detalhada dos itens.
              </span>
            </li>
            <li className="flex gap-x-3">
              <CheckCircleIcon className="mt-1 h-5 w-5 flex-none text-red-600" aria-hidden="true" />
              <span>
                <strong className="font-semibold text-gray-900">Fotos dos Itens.</strong> Adicione até 4 fotos dos itens para ajudar os destinatários a verem o que está sendo doado.
              </span>
            </li>
          </ul>
          <figure className="mt-16">
            <Image
              className=" rounded-xl bg-gray-50 object-cover"
              src={form}
              alt="Confirmação de Doação"
              width={873}
              height={2310}
            />
            <figcaption className="mt-4 flex gap-x-2 text-sm leading-6 text-gray-500">
              <InformationCircleIcon className="mt-0.5 h-5 w-5 flex-none text-gray-300" aria-hidden="true" />
              Tela do formulário para preencher itens referentes a doação.
            </figcaption>
          </figure>

          <h2 className="mt-16 text-2xl font-bold tracking-tight text-gray-900">Passo 3: Revisão dos Itens</h2>
          <p className="mt-6">
            Revise os itens que você adicionou antes de finalizar a doação. Você pode remover itens indesejados ou adicionar mais itens.
          </p>
          <figure className="mt-10 border-l border-red-600 pl-9">
            <blockquote className="font-semibold text-gray-900">
              <p>
                “Verifique todas as informações cuidadosamente para garantir que estão corretas.”
              </p>
            </blockquote>
          </figure>
          <figure className="mt-16">
            <Image
              className="rounded-xl bg-gray-50 object-cover"
              src={itens}
              alt="Confirmação de Doação"
            />
            <figcaption className="mt-4 flex gap-x-2 text-sm leading-6 text-gray-500">
              <InformationCircleIcon className="mt-0.5 h-5 w-5 flex-none text-gray-300" aria-hidden="true" />
              Tela de itens adicionados atráves do formulário.
            </figcaption>
          </figure>

          <h2 className="mt-16 text-2xl font-bold tracking-tight text-gray-900">Passo 4: Finalizar a Doação</h2>
          <p className="mt-6">
            Quando estiver satisfeito com as informações, clique no botão "Anunciar doação". Se você já adicionou todos os itens que deseja doar, clique em "Finalizar agora".
          </p>
          <figure className="mt-16">
            <Image
              className="rounded-xl bg-gray-50 object-cover"
              src={button}
              alt="Confirmação de Doação"
            />
            <figcaption className="mt-4 flex gap-x-2 text-sm leading-6 text-gray-500">
              <InformationCircleIcon className="mt-0.5 h-5 w-5 flex-none text-gray-300" aria-hidden="true" />
              Botão para finalizar a doação.
            </figcaption>
          </figure>

          <h2 className="mt-16 text-2xl font-bold tracking-tight text-gray-900">Passo 5: Confirmação</h2>
          <p className="mt-6">
            Após anunciar sua doação, você será redirecionado para uma página de confirmação. Parabéns, você ajudou alguém necessitado!
          </p>
          
          <figure className="mt-16">
            <Image
              className="aspect-video rounded-xl bg-gray-50 object-cover"
              src={thanks}
              alt="Confirmação de Doação"
            />
            <figcaption className="mt-4 flex gap-x-2 text-sm leading-6 text-gray-500">
              <InformationCircleIcon className="mt-0.5 h-5 w-5 flex-none text-gray-300" aria-hidden="true" />
              Tela de confirmação após o anúncio da doação.
            </figcaption>
          </figure>
        </div>
      </div>
    </div>
    </>
  );
}
