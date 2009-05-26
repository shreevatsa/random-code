#include <iostream>
#include <vector>
#include <sstream>
#include <string>
using namespace std;

#define FCO(i,a,b) for(int i=a,_b=b;i<_b;++i)
#define FOR(i,n) FCO(i,0,n)
#define SZ(s) signed(s.size())
#define FOZ(i,s) FOR(i,SZ(s))
#define LET(a,b) typeof(b) a=b
#define FOREACH(i,v) for(LET(i,v.begin());i!=v.end();++i)
#define PB push_back
typedef vector<int> VI;
typedef long long ll;

ostream& operator<<(ostream& o, VI v) {
  FOZ(i,v) { if(i) o<<"*"; o<<v[i]; }
  return o;
}

const int MAXN=100000000;
int fifac[MAXN];

VI factors(int n) {
  VI ret;
  while(n>1) {
    ret.PB(fifac[n]);
    n/=fifac[n];
  }
  return ret;
}

int phi(int n) {
  ll ret=1;
  while(n>1) {
    int p = fifac[n], pk=1;
    while(n>1 and fifac[n]==p) { n/=p; pk*=p; }
    ret *= pk-pk/p;
  }
  return ret;
}

bool good(int n) {
  return (n-1) % (n-phi(n)) == 0;
}

int main() {
  FOR(i,MAXN) fifac[i]=i;
  FCO(i,2,MAXN) {
    if(fifac[i]<i) continue;
    for(ll j=ll(i)*i; j<MAXN; j+=i) {
      if(fifac[j]==j) fifac[j]=i;
    }
  }

  FCO(n,2,MAXN) {
    if(fifac[n]!=n and good(n))
      {
        cout<<n<<": "<<factors(n)<<endl;
      }
  }

  return 0;
}
