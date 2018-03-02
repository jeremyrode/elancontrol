#include <iostream>
#include <boost/array.hpp>
#include <boost/asio.hpp>
#include <boost/lexical_cast.hpp>

using boost::asio::ip::udp;

int main(int argc, char* argv[])
{
  try
  {
    if (argc != 2)
    {
	    std::cerr << "IP adress" << std::endl;
	    return 1;
    }
    boost::asio::io_service io_service;

    udp::endpoint local_endpoint = boost::asio::ip::udp::endpoint(
	  boost::asio::ip::address::from_string(argv[1]), 6969);
    std::cout << "Local bind " << local_endpoint << std::endl;
 
    udp::socket socket(io_service, local_endpoint);

    boost::array<char, 128> recv_buf;
    
    udp::endpoint sender_endpoint;
    size_t len = socket.receive_from(boost::asio::buffer(recv_buf), sender_endpoint);
    std::cout.write(recv_buf.data(), len);
  }
  catch (std::exception& e)
  {
    std::cerr << e.what() << std::endl;
  }

  return 0;
}
