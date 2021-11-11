import React from 'react';
import { useSelector, useStore } from 'react-redux';
import { wrapper } from '@/redux/store';

const Page = (props) => {
  console.log('State on render', useStore().getState(), { props });
  const content = useSelector(selectSomething(props.id));

  if (!content) {
    return <div>RENDERED WITHOUT CONTENT FROM STORE!!!???</div>;
  }

  return (
    <div>
      <h3>{content}</h3>
    </div>
  );
};

export const getServerSideProps = wrapper.getServerSideProps(
  (store) =>
    async ({ params }) => {
      const { id } = params;

      await store.dispatch(fetchSubject(id)); // o puede usarse hooks de `useDispatch`

      return {
        props: {
          id,
        },
      };
    }
);

export default Page;
