import React from 'react';
import { useSelector, useStore } from 'react-redux';
import { wrapper } from '@/src/redux/store';
import { getById } from '@/modules/Dashboard/dashboardSlice';
import { dataByIdSelector } from '@/modules/Dashboard/dashboardSelectors';

const Page = (props) => {
  console.log('State on render', useStore().getState(), { props });
  const dataById = useSelector(dataByIdSelector);

  if (!dataById) {
    return <div>RENDERED WITHOUT CONTENT FROM STORE!!!???</div>;
  }

  return (
    <div>
      <h3>{dataById.id}</h3>
      <h3>{dataById.item}</h3>
      <h3>{dataById.content}</h3>
    </div>
  );
};

export const getServerSideProps = wrapper.getServerSideProps(
  (store) =>
    async ({ params }) => {
      const { id } = params;

      await store.dispatch(getById(id)); // o puede usarse hooks de `useDispatch`

      return {
        props: {
          id,
        },
      };
    }
);

export default Page;
