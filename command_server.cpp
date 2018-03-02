#include <iostream>
#include <boost/array.hpp>
#include <boost/asio.hpp>
#include <boost/lexical_cast.hpp>

using boost::asio::ip::udp;

int main(int argc, char* argv[])
{
  try
  {

    boost::asio::io_service io_service;

    udp::endpoint local_endpoint = boost::asio::ip::udp::endpoint(
	  127.0.0.1, 6969);
    std::cout << "Local bind " << local_endpoint << std::endl;
 
// MODE 1: WORKS  
    udp::socket socket(io_service, local_endpoint);

// MODE 2: WORKS
//    udp::socket socket(io_service, udp::endpoint(udp::v4(), boost::lexical_cast<int>(argv[2]) )),

// MODE 3: WORKS
//    udp::socket socket(io_service);
//    socket.open(udp::v4());
//    socket.bind(local_endpoint);
///////////////

    boost::array<char, 128> recv_buf;
    
    udp::endpoint sender_endpoint;
    size_t len = socket.receive_from(
        boost::asio::buffer(recv_buf), sender_endpoint);

    std::cout.write(recv_buf.data(), len);
  }
  catch (std::exception& e)
  {
    std::cerr << e.what() << std::endl;
  }

  return 0;
}