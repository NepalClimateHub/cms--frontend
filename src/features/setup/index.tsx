
import { Main } from '@/ui/layouts/main';
import PageHeader from '@/ui/page-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/ui/shadcn/tabs';
import TagsList from '../tags/list';
import CategoriesList from './components/categories-list';

export default function SetupPage() {
  return (
    <Main>
      <PageHeader
        title='Setup'
        description='Manage tags and categories for your content.'
      />
      <div className='mt-6'>
        <Tabs defaultValue='tags' className='w-full'>
          <TabsList className='grid w-full grid-cols-2 lg:w-[400px]'>
            <TabsTrigger value='tags'>Tags</TabsTrigger>
            <TabsTrigger value='categories'>Categories</TabsTrigger>
          </TabsList>
          
          <TabsContent value='tags' className='mt-6'>
            <div className='-mx-4'>
              <TagsList embedded />
            </div>
          </TabsContent>
          
          <TabsContent value='categories' className='mt-6'>
            <div className='-mx-4'>
              <CategoriesList />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Main>
  );
}
