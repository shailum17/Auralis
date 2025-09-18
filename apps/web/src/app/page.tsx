export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to Student Community Platform
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          A privacy-first, supportive community designed for students
        </p>
        
        <div className="grid md:grid-cols-3 gap-8 mt-12">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-2">Safe & Anonymous</h3>
            <p className="text-gray-600">
              Share your thoughts and experiences anonymously while maintaining privacy
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-2">Supportive Community</h3>
            <p className="text-gray-600">
              Connect with fellow students and access mental health resources
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-2">Wellness Focused</h3>
            <p className="text-gray-600">
              Track your mood and receive personalized wellness recommendations
            </p>
          </div>
        </div>
        
        <div className="mt-12 flex justify-center gap-4">
          <button type="button" className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-6 rounded-lg transition-colors">
            Get Started
          </button>
          <button type="button" className="bg-secondary-100 hover:bg-secondary-200 text-secondary-900 font-medium py-3 px-6 rounded-lg transition-colors">
            Learn More
          </button>
        </div>
      </div>
    </main>
  )
}