import { getBooks } from '@/src/lib/actions/getBooks';
import { getUser } from '@/src/lib/actions/createUser';

const Page = async () => {
  const user = await getUser("1234");
  console.log("user from client", user)
    const books = await getBooks("1234");
    console.log("books", books);
  return (
    // <main className="min-h-screen p-8">
    //   <h1 className="text-3xl font-bold text-center mb-8">Book Information Extractor</h1>
    //   <p className="text-center text-gray-600 mb-8">
    //     Upload up to 2 images of a book cover to extract its information
    //   </p>
    //   <BookImageExtractor />
    // </main>

    <>
    helloworld

    </>
  );
}

export default Page